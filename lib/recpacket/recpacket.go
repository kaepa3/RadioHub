package recpacket

import (
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"
)

type RecordingRequest struct {
	Channel   string `json:"channel"`
	Date      string `json:"date"`
	Time      string `json:"start"`
	RecType   string `json:"rec_type"`
	RecMinute string `json:"rec_minute"`
}

const layout = "01/02/2006"

func (req RecordingRequest) GetRecordingTime() (time.Time, error) {
	recTime, err := time.Parse(layout, req.Date)
	if err != nil {
		fmt.Println(err)
		return time.Now(), errors.New("parse error")
	}
	slice := strings.Split(req.Time, ":")
	if len(slice) != 2 {
		return time.Now(), errors.New("parse error")
	}
	hour, _ := strconv.Atoi(slice[0])
	minute, _ := strconv.Atoi(slice[1])

	return time.Date(recTime.Year(), recTime.Month(), recTime.Day(), hour, minute, 0, 0, time.Local), nil
}
func (req RecordingRequest) GetNextRecordingTime() (time.Time, error) {
	recTime, err := req.GetRecordingTime()
	if err != nil {
		return recTime, err
	}

	bufferTime := recTime
	for {
		if CheckTimeBefore(bufferTime) {
			bufferTime = bufferTime.AddDate(0, 0, 7)
		} else {
			break
		}
	}
	return bufferTime, nil
}
func (req RecordingRequest) CheckTimeBefore() (bool, error) {
	if date, err := req.GetRecordingTime(); err == nil {
		return CheckTimeBefore(date), nil
	} else {
		return false, err
	}
}
func CheckTimeBefore(t time.Time) bool {
	now := time.Now()
	return !t.After(now)
}
