// In this example we'll look at how to implement
// a _worker pool_ using goroutines and channels.

package main

import (
	"fmt"

	"log"
        "sync/atomic"
	"time"
	"database/sql"
	_ "github.com/go-sql-driver/mysql"
)

var jobs = make(chan [2]string)
var done = make(chan bool)

var value uint64 = 0

// Here's the worker, of which we'll run several
// concurrent instances. These workers will receive
// work on the `jobs` channel and send the corresponding
// results on `results`. We'll sleep a second per job to
// simulate an expensive task.

var db, dberr = sql.Open("mysql", "defakeroot:password@tcp(defakerinstance.cugwghd6snte.ap-northeast-2.rds.amazonaws.com:3306)/fakerdb")

func worker(id int, jobs <-chan [2]string) {
    for j := range jobs {
        var _, execerr = db.Exec("INSERT IGNORE INTO active_wallets VALUES (?, ?, ?, ?, ?)", atomic.AddUint64(&value, 1), j[0], j[1], "dex", "idex")
        if execerr != nil {
            log.Fatal(execerr)
        }
    }
}

func main() {

	defer db.Close()
        db.SetConnMaxLifetime(time.Minute * 5)
	db.SetMaxIdleConns(500)
	db.SetMaxOpenConns(500)

        for w := 1; w <= 50; w++ {
            go worker(w, jobs)
        }

        read_query := fmt.Sprintf("SELECT * FROM transactions WHERE to_address = '0x2a0c0DBEcC7E4D658f48E01e3fA353F44050c208'")
        fmt.Println(read_query)
        rows, err := db.Query(read_query)
        if err != nil {
            panic(err.Error())
        }

        for rows.Next(){
            var id int
            var hash string
            var nonce string
            var block_hash string
            var block_number int
            var transaction_index int
            var from_address string
            var to_address string
            var value int
            var gas int
            var gas_price int
            var input string
            var block_timestamp int
            err := rows.Scan(&id, &hash, &nonce, &block_hash, &block_number, &transaction_index, &from_address, &to_address, &value, &gas, &gas_price, &input, &block_timestamp)
            if err != nil{
              panic(err.Error())
            }
            arr := [2]string{from_address, to_address}
            jobs <- arr
        }
        close(jobs)
	fmt.Println("sent all jobs")

	<-done
}
