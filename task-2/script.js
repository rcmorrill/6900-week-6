var w = d3.select('.plot').node().clientWidth,
    h = d3.select('.plot').node().clientHeight;

var queue = d3_queue.queue()
    .defer(d3.csv,'../data/hubway_trips_reduced.csv',parse)
    .defer(d3.csv,'../data/hubway_stations.csv',parseStations)
    .await(dataLoaded);


var globalDispatcher = d3.dispatch('changeinterval','changestation');

d3.selectAll('.interval').on('click',function(){
    var id = d3.select(this).attr('id');
    globalDispatcher.changeinterval(id);

})

d3.select('.station-list').on('change',function(){
    globalDispatcher.changestation(this.value)
})

// Step 1: populate UI
// Step 2: create event dispatcher
// Step 3: emit events and event listeners

function dataLoaded(err,rows,stations){


    //create nested hierarchy based on stations
    var tripsByStation = d3.nest()
        .key(function(d){return d.startStation})
        //.entries(rows);
        .map(rows, d3.map);


    console.log(tripsByStation.get(5))

    var timeSeriesModule = d3.timeSeries()
        .width(w).height(h)
        .timeRange([new Date(2011,6,16),new Date(2013,11,15)])
        .value(function(d){ return d.startTime; })
        .maxY(50)
        .binSize(d3.time.week)

    var plots = d3.select('.container').select('.plot')
        //.datum(tripsByStation[0].values)
        .datum(tripsByStation.get(3))
        .call(timeSeriesModule);

        globalDispatcher.on('changeinterval',function(interval){
            var newInterval = interval=="d"?d3.time.day:d3.time.week;
            timeSeriesModule.binSize(newInterval);
            plots.call(timeSeriesModule);
        });

        globalDispatcher.on('changestation', function(id){
            // plots.datum(tripsByStation[station].values)
            // plots.call(timeSeriesModule);
            //this doesn't work because the station id is not the same as the index number

            plots.datum(tripsByStation.get(id))
            plots.call(timeSeriesModule);


             //another way to do it
             //tripsByStation.filter(function(d){return d.key==id})

        });

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

