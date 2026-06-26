package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
)

func main() {
	execPath, err := os.Executable()
	var defaultRoot string
	if err == nil {
		defaultRoot = filepath.Dir(execPath)
	} else {
		defaultRoot, _ = os.Getwd()
	}

	port := flag.Int("port", 8080, "HTTP 监听端口")
	root := flag.String("dir", defaultRoot, "静态文件根目录")
	flag.Parse()

	if _, err := os.Stat(*root); os.IsNotExist(err) {
		log.Fatalf("目录不存在: %s", *root)
	}

	absRoot, _ := filepath.Abs(*root)
	addr := fmt.Sprintf(":%d", *port)

	absRoot = strings.TrimRight(absRoot, "/\\")

	log.Printf("静态服务已启动")
	log.Printf("  根目录: %s", absRoot)
	log.Printf("  访问地址: http://localhost:%d", *port)
	log.Printf("  按 Ctrl+C 退出")

	server := &http.Server{Addr: addr, Handler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := filepath.Join(absRoot, filepath.FromSlash(r.URL.Path))

		info, err := os.Stat(path)
		if err == nil && !info.IsDir() {
			http.ServeFile(w, r, path)
			return
		}

		indexPath := filepath.Join(absRoot, "index.html")
		if _, err := os.Stat(indexPath); err == nil {
			http.ServeFile(w, r, indexPath)
			return
		}

		http.NotFound(w, r)
	})}

	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("服务启动失败: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("正在关闭服务...")
	server.Close()
	log.Println("服务已关闭")
}
