var express = require('express');
var app = express();
var http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 8080;


app.get('/' , function(req, res){

    app.use('/css',express.static(__dirname + '/css'));
    res.sendFile(__dirname+'/index.html');
});


io.on('connection' , function(socket){
 
    socket.on('rYesterdaySignal',function(msg){
        io.emit('sYesterdaySignal',msg)
    });

    socket.on('rAggregateList',function(msg){
        io.emit('sAggregateList',msg)
    });

    socket.on('rSignalList' , function(msg){
        io.emit('sSignalList',msg);         
    });

    socket.on('rBreakTimeInfo' , function(msg){
        io.emit('sBreakTimeInfo',msg);         
    });

    socket.on('rPriceList' , function(msg){
        io.emit('sPriceList',msg);         
    });

    socket.on('console',function(msg){
        switch( msg ) {
            case 'start': /* リアル時価の取得開始 */
                console.log(`command: ${msg}`);
                break;
            case 'end':  /* リアル時価の取得終了 */
                console.log(`command: ${msg}`);
                io.emit('end',"実行を終了する")
                break;
            case 'reopen':  /* リアル時価の取得再開 */
                console.log(`command: ${msg}`);
                break;
            case 'init':  /* 前日シグナルの取得 */
                console.log(`command: ${msg}`);
                break;
            case 'status':  /* 接続状況の取得 */
                console.log(`command: ${msg}`);
                break;
            default:   /* 想定外のコマンド */
                console.log(`undefined command ${msg}`);
                break; 
        }
    });
});

http.listen(PORT, function(){
    console.log(`server listening. Port:${PORT}`);
});