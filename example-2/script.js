var w = d3.select('.plot').node().clientWidth,
    h = d3.select('.plot').node().clientHeight;

var queue = d3_queue.queue()
    .defer(d3.csv,'../data/hubway_trips_reduced.csv',parse)
    .defer(d3.csv,'../data/hubway_stations.csv',parseStations)
    .await(dataLoaded);

var globalDispatcher = d3.dispatch('stationchange', 'intervalchange');

function dataLoaded(err,rows,stations){

    d3.select('.station-list').on('change',function(){
        globalDispatcher.stationchange(this.value);
    });
    d3.selectAll('.interval').on('click',function(){
        globalDispatcher.intervalchange(d3.select(this).attr('id'));
    })

    //create nested hierarchy based on stations
    var tripsByStation = d3.nest()
        .key(function(d){return d.startStation})
        .map(rows,d3.map);

    var timeSeriesModule = d3.timeSeries()
        .width(w).height(h)
        .timeRange([new Date(2011,6,16),new Date(2013,11,15)])
        .value(function(d){ return d.startTime; })
        .maxY(50)
        .binSize(d3.time.week)

    var plots = d3.select('.container').select('.plot')
        .datum(tripsByStation.get('3'))
        .call(timeSeriesModule);

    globalDispatcher.on('stationchange',function(id){
        plots.datum(tripsByStation.get(id))
            .call(timeSeriesModule);
    });
    globalDispatcher.on('intervalchange',function(int){
        var interval = int=='d'?d3.time.day:d3.time.week;
        timeSeriesModule.binSize(interval);
        plots.call(timeSeriesModule)
    })

}

function parse(d){
    if(+d.duration<0) return;

    return {
        duration: +d.duration,
        startTime: parseDate(d.start_date),
        endTime: parseDate(d.end_date),
        startStation: d.strt_statn,
        endStation: d.end_statn
    }
}

function parseDate(date){
    var day = date.split(' ')[0].split('/'),
        time = date.split(' ')[1].split(':');

    return new Date(+day[2],+day[0]-1, +day[1], +time[0], +time[1]);
}

function parseStations(s){
    d3.select('.station-list')
        .append('option')
        .html(s.station)
        .attr('value', s.id);
}

