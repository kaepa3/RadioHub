module github.com/kaepa3/RadioHub

go 1.15

replace github.com/kaepa3/RadioHub/lib/recpacket => ./lib

require (
	github.com/briandowns/spinner v1.11.1 // indirect
	github.com/gin-contrib/static v0.0.0-20200916080430-d45d9a37d28e
	github.com/gin-gonic/gin v1.6.3
	github.com/grafov/m3u8 v0.11.1 // indirect
	github.com/kaepa3/RadioHub/lib/recpacket v0.0.0-00010101000000-000000000000
	github.com/mitchellh/cli v1.1.2 // indirect
	github.com/olekukonko/tablewriter v0.0.4 // indirect
	github.com/yyoshiki41/go-radiko v0.6.0 // indirect
	github.com/yyoshiki41/radigo v0.9.0
	go.mongodb.org/mongo-driver v1.4.2
)
