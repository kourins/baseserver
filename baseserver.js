var express = require('express');
var app = express();
var http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 8080;
var  jsonStatusList = {'webserver':'ON','chartserver':'OFF','dataserver':'OFF','rssserver':'OFF','webclient':'OFF'};

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

    socket.on('rStatusOn',function(msg){
        jsonStatusList[msg] = 'ON';
        if( ( msg == 'chartserver' || msg == 'webclient') && jsonStatusList['chartserver'] =='ON' && jsonStatusList['webclient'] =='ON'){
            io.emit('sRequestChartInfo','');
        }
        io.emit('sStatus',JSON.stringify(jsonStatusList))
    });

    socket.on('rStatusOff',function(msg){
        jsonStatusList[msg] = 'OFF';
        io.emit('sStatus',JSON.stringify(jsonStatusList))
    });

    socket.on('rBreakTimeInfo' , function(msg){
        /* console.log(`rBreakTimeInfo: ${msg}`); */
        var tmpJson = JSON.parse(msg)      
        io.emit('sBreakTimeInfo',msg);
    });

    socket.on('rSendChartInfo', function(msg){
        //console.log(`rSendChartInfo: ${msg}`)
        io.emit('sSendChartInfo',msg);
    });

    socket.on('rPriceList' , function(msg){
        io.emit('sPriceList',msg);         
    });

    socket.on('rDetailInfoOpen' , function(msg){
        io.emit('sDetailInfoOpen',msg);         
    });

    socket.on('rDetailInfoClose' , function(msg){
        io.emit('sDetailInfoClose',msg);         
    });

    socket.on('rSendDetailInfo' , function(msg){
        io.emit('sSendDetailInfo',msg);         
    });

    socket.on('console',function(msg){
        switch( msg ) {
            case 'status':  /* 接続状況の取得 */
                console.log(JSON.stringify(jsonStatusList));
                io.emit('sStatus',JSON.stringify(jsonStatusList))
                break;
            case 'min01': /*画面からのチャート足の変更 */
            case 'min05':
            case 'min30':
            case 'min60':
            case 'min300':
                io.emit('sChangeChart',msg);
                break;
            case 'end':  /* DbServer終了 */
                io.emit('sSaveDataInfo',"Save");
                break;
            case 'dataserverclose':
                io.emit('sSaveDataInfo','Save');
                break;
            case 'chartserverclose':
                io.emit('sChartControlClose','');
                break;
            case 'webserverclose':
                jsonStatusList['webserver'] = 'OFF';
                io.emit('sStatus',JSON.stringify(jsonStatusList))
                io.close()
                process.exit(0);                       
            default:   /* 想定外のコマンド */
                console.log(`undefined command ${msg}`);
                break; 
        }
    });
});

http.listen(PORT, function(){
    console.log(`server listening. Port:${PORT}`);
});