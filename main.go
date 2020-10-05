package main

import (
	"fmt"
	"net/http"
)

func main() {
	// buildフォルダを公開
	http.Handle("/", http.FileServer(http.Dir("./radiohub/build")))

	// 前述のhomepageを記述してないと下の記述でしか動かない。他のパスだとバグる
	// http.Handle("/", http.FileServer(http.Dir("./build")))

	fmt.Println("Server Started Port 8080")
	http.ListenAndServe(":8080", nil)
}
