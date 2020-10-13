package RecordingRequest

import "time"

type RecordingRequest struct {
	Channel   string `json:"channel"`
	Date      string `json:"date"`
	StartTime string `json:"start"`
	IsNow     string `json:"is_now"`
	RecMinute string `json:"rec_minute"`
}

func (req RecordingRequest) GetRecordingTime() time.Time {

}
