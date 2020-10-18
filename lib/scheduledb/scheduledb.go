package scheduledb

import (
	"context"
	"errors"
	"log"

	"github.com/kaepa3/RadioHub/lib/recpacket"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Schedules struct {
	client     *mongo.Client
	collection *mongo.Collection
}

func (sch *Schedules) GetAll() ([]recpacket.RecordingRequest, error) {
	if err := sch.open(); err != nil {
		return nil, err
	}
	defer sch.close()
	cur, err := sch.collection.Find(context.Background(), bson.D{})
	if err != nil {
		log.Fatalln(err)
		return make([]recpacket.RecordingRequest, 0), errors.New("asfd")
	}

	docs := make([]recpacket.RecordingRequest, 0, 20)
	for cur.Next(context.Background()) {
		var doc recpacket.RecordingRequest
		if err := cur.Decode(&doc); err != nil {
			log.Println(err)
		} else {
			docs = append(docs, doc)
		}
	}
	return docs, nil
}
func (sch *Schedules) InsertOne(ctx context.Context, document interface{}, opts ...*options.InsertOneOptions) (*mongo.InsertOneResult, error) {
	if err := sch.open(); err != nil {
		return nil, err
	}
	defer sch.close()
	return sch.collection.InsertOne(ctx, document)
}
func (sch *Schedules) open() error {
	cl, err := mongo.NewClient(options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		return err
	}

	if err = cl.Connect(context.Background()); err != nil {
		return err
	}
	sch.client = cl
	sch.collection = sch.client.Database("radiohub").Collection("schedule")

	return nil
}

func (sch *Schedules) close() error {
	return sch.client.Disconnect(context.Background())
}
