# 静态文件服务

## 使用方式

### 默认（以当前目录为根目录）

```bat
serve.exe
```

### 指定端口

```bat
serve.exe -port 3000
```

### 指定根目录

```bat
serve.exe -dir D:\path\to\dist
```

### 同时指定端口和目录

```bat
serve.exe -port 3000 -dir D:\path\to\dist
```

启动后访问 http://localhost:8080，按 Ctrl+C 退出服务。
