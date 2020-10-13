package RecordingRequest

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetRecordingTime(t *testing.Test) {
	var v RecordingRequest
	v.Date = "01/02/2020"
	v.StartTime = "19:00"
	recTime := v.GetRecordingTime()
	assert.Equal(t, 2020, recTime.Year())
	assert.Equal(t, 2, recTime.Month())
	assert.Equal(t, 1, recTime.Day())
	assert.Equal(t, 19, recTime.Hour())
	assert.Equal(t, 0, recTime.Minute())
}
