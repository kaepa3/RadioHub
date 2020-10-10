package main

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	client, err := mongo.NewClient(options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		return
	}

	if err = client.Connect(context.Background()); err != nil {
		return
	}
	defer client.Disconnect(context.Background())
	col := client.Database("test").Collection("col")
	if err = insertBsonD(col); err != nil {
		return
	}
}
func insertBsonD(col *mongo.Collection) error {
	bsonD := bson.D{
		{"str1", "abc"},
		{"num1", 1},
		{"str2", "xyz"},
		{"num2", bson.A{2, 3, 4}},
		{"subdoc", bson.D{{"str", "subdoc"}, {"num", 987}}},
		{"date", time.Now()},
	}
	_, err := col.InsertOne(context.Background(), bsonD)
	return err
}
