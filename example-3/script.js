var w = d3.select('.plot').node().clientWidth,
    h = d3.select('.plot').node().clientHeight;

var globalDispatch = d3.dispatch('pickTime');



d3.csv('../data/hubway_trips_reduced.csv',parse,dataLoaded);

function dataLoaded(err,rows){


    //create nested hierarchy based on stations
    var tripsByStation = d3.nest()
        .key(function(d){return d.startStation})
        .entries(rows);

    //create a <div> for each station
    //bind trips data to each station
    var plots = d3.select('.container').selectAll('.plot')
        .data(tripsByStation);

    plots
        .enter()
        .append('div').attr('class','plot');

    plots
        .each(function(d,i){
            var timeSeries = d3.timeSeries()
                .width(w).height(h)
                .timeRange([new Date(2011,6,16),new Date(2013,11,15)])
                .value(function(d){ return d.startTime; })
                .maxY(150)
                .binSize(d3.time.week)
                .on('hover',function(t){
                    globalDispatch.pickTime(t);
                });

            globalDispatch.on('pickTime.'+i, function(t){
                timeSeries.showValue(t);
            });

            d3.select(this).datum(d.values)
                .call(timeSeries);

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

