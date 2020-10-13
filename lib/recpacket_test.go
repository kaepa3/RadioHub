package recpacket

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestGetRecordingTime(t *testing.T) {

	var v RecordingRequest
	v.Date = "01/02/2020"
	v.StartTime = "19:00"
	recTime := v.GetRecordingTime()
	assert.Equal(t, 2020, recTime.Year())
	assert.Equal(t, time.Month(1), recTime.Month())
	assert.Equal(t, 2, recTime.Day())
	assert.Equal(t, 19, recTime.Hour())
	assert.Equal(t, 0, recTime.Minute())
}
