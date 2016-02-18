var m = {t:50,r:50,b:50,l:50},
    w = d3.select('.plot').node().clientWidth - m.l - m.r,
    h = d3.select('.plot').node().clientHeight - m.t - m.b;

var data = d3.range(10).map(function(d){return Math.random()*100});
console.log(data);



var dis = d3.dispatch('pickcircle','unpickcircle');

d3.selectAll('.plot')
    .append('svg')
    .attr('width',w+ m.l+ m.r)
    .attr('height',h+ m.t + m.b)
    .append('g')
    .attr('transform','translate('+ m.l+','+ m.t+')')
    .each(function(d,i){

        var circles = d3.select(this)
            .selectAll('circle')
            .data(data)
            .enter()
            .append('circle')
            .attr('cx',function(d,i){return w/9*i})
            .attr('cy',h/2)
            .attr('r',10)
            .on('mouseenter', function(datum,index){
                dis.pickcircle(index);
            })
            .on('mouseleave', function(datum,index){
                dis.unpickcircle(index);
            })

        dis.on('pickcircle.'+i,function(i){
            circles.filter(function(d,_i){
                return _i == i;
            }).style('fill','red');

        })

        dis.on('unpickcircle.'+i,function(){
            circles.style('fill',null);
        })
    })

//Append the same 10 circles to #plot-2


//Task: how do these two plots talk to each other?

