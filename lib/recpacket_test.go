package recpacket

import (
	"fmt"
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

func TestCheckTimeBefore(t *testing.T) {
	patterns := []struct {
		a        time.Time
		expected bool
	}{
		{time.Now().Add(-2 * time.Hour), true},
		{time.Now(), true},
		{time.Now().Add(2 * time.Hour), false},
	}
	for i, v := range patterns {
		var buff RecordingRequest
		cTime := v.a
		buff.Date = fmt.Sprintf("%02d/%02d/%04d", cTime.Month(), cTime.Day(), cTime.Year())
		buff.StartTime = fmt.Sprintf("%d:%d", cTime.Hour(), cTime.Minute())
		assert.Equal(t, v.expected, CheckTimeBefore(buff), fmt.Sprintf("index:%d", i))
	}

}
