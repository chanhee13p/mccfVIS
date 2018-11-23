function modelRankingVis() {
    let that = this;

    const root = d3.select('#model-ranking-vis');

    const WIDTH = 1516;
    // const WIDTH = 1316;
    const HEIGHT = 334;

    const MARGIN_TOP = 80;
    const RANKING_VIS_HEIGHT = HEIGHT - MARGIN_TOP;
    const CELL_HEIGHT = RANKING_VIS_HEIGHT / (CONSTANT.MODEL_NAMES.length);
    const BAR_HEIGHT = CELL_HEIGHT * 0.6;
    const BAR_MARGIN_TOP = (CELL_HEIGHT - BAR_HEIGHT) / 2;
    const HEIGHT_RANKING_LINE_HEIGHT = CELL_HEIGHT * 0.8;

    const MARGIN_LEFT = CONSTANT.MARGIN_LEFT;
    const MARGIN_RIGHT = CONSTANT.MARGIN_RIGHT;
    const RANKING_VIS_WIDTH = WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
    const CELL_WIDTH = RANKING_VIS_WIDTH / 10;

    const TEXT_X_END = 50;
    const SPARK_LINE_MARGIN = 20;
    const SPARK_LINE_INTERVAL = (MARGIN_LEFT - TEXT_X_END - (SPARK_LINE_MARGIN * 2) - 60) / 11;

    const CIRCLE_STROKE_WIDTH = 4;
    const SPARK_LINE_WIDTH = 4;
    const RANKING_STROKE_WIDTH = 8;

    const MIN_SCORE = 0.5;
    const MAX_RADIUS = CELL_HEIGHT / 2;

    let models_performance = Processor.getPerformances(CONSTANT.MODEL_NAMES);

    let selected_model = null;

    this.update = function (data, criteria) {
        models_performance = data;
        const ranking_info = getRankingInfo(criteria);

        // toDo : 트렌지션 적용 시키면 간지쩔탱
        draw(ranking_info);
    };

    const ranking_info = getRankingInfo('true');
    draw(ranking_info);

    function draw(ranking_info) {
        removeAll();

        // 클래스의 이름을 적는다.
        root.append('text')
            .text("ACTUAL CLASS")
            .attrs({
                x: WIDTH / 2,
                y: MARGIN_TOP - 50,
                'font-size': CONSTANT.FONT_SIZE.default,
                'fill': '#555',
                'text-anchor': 'middle',
                'alignment-baseline': 'hanging',
            });
        root.append('text')
            .text("Average")
            .attrs({
                x: TEXT_X_END + SPARK_LINE_MARGIN * 3 + SPARK_LINE_INTERVAL * 10,
                y: MARGIN_TOP - 25,
                'font-size': CONSTANT.FONT_SIZE.default,
                'fill': '#555',
                'text-anchor': 'middle',
                'alignment-baseline': 'hanging',
            });
        for (let digit = 0; digit < 10; digit++) {
            const x = MARGIN_LEFT + CELL_WIDTH * digit + CELL_WIDTH / 2;
            root.append('text')
                .text(digit)
                .attrs({
                    x: x,
                    y: MARGIN_TOP - 25,
                    'font-size': CONSTANT.FONT_SIZE.default,
                    'fill': '#555',
                    'text-anchor': 'middle',
                    'alignment-baseline': 'hanging',
                });
        }

        // 각각의 모델을 순회하며 그린다.
        _.forEach(CONSTANT.MODEL_NAMES, (model_name, i) => {
            const model_performance = models_performance[model_name];
            const ranking_line = [];

            // 모델 이름을 적는다.
            const x = TEXT_X_END - SPARK_LINE_MARGIN;
            const y = MARGIN_TOP + (i * CELL_HEIGHT);
            root.append('text')
                .text(CONSTANT.MODEL_NAMES_TO_DRWA[model_name])
                .attrs({
                    x: x,
                    y: y + (CELL_HEIGHT / 2),
                    'text-anchor': 'start',
                    'alignment-baseline': 'middle',
                    'fill': '#333',
                    'font-size': CONSTANT.FONT_SIZE.default,
                })
                .classed(model_name, true);

            // 제목 셀의 하이라이팅을 위한 배경
            root.append('rect')
                .attrs({
                    x: 15,
                    y: MARGIN_TOP + (i * CELL_HEIGHT) + CELL_HEIGHT * 0.1,
                    width: MARGIN_LEFT - 40,
                    height: HEIGHT_RANKING_LINE_HEIGHT,
                    fill: CONSTANT.COLORS[model_name],
                    opacity: 0
                })
                .classed('cell-background', true)
                .classed('name-cell-background', true)
                .classed(model_name, true);

            // 짝수열 회색배경으로 구분
            if (i % 2 === 0) {
                root.append('rect')
                    .attrs({
                        x: 15,
                        y: MARGIN_TOP + (i * CELL_HEIGHT),
                        width: MARGIN_LEFT,
                        height: CELL_HEIGHT,
                        fill: '#eee',
                    })
                    .classed('cell-background', true);
            }

            ranking_line.push({
                x: MARGIN_LEFT - 45,
                y: y + (CELL_HEIGHT / 2)
            });
            ranking_line.push({
                x: MARGIN_LEFT - 15,
                y: y + (CELL_HEIGHT / 2)
            });

            // 각각의 클래스를 순회하며 그린다.
            const spark_line_y = [];
            _.forEach(model_performance, (performance_by_class, digit) => {
                spark_line_y.push(performance_by_class['true']);
                digit = parseInt(digit);

                const ranking = ranking_info[digit].indexOf(model_name);
                const x = MARGIN_LEFT + (digit * CELL_WIDTH);
                const y = MARGIN_TOP + (ranking * CELL_HEIGHT);

                // 짝수열 회색 배경으로 구분
                if (ranking % 2 === 0) {
                    root.append('rect')
                        .attrs({
                            x: x,
                            y: y,
                            width: CELL_WIDTH,
                            height: CELL_HEIGHT,
                            fill: '#eee',
                        })
                        .classed('cell-background', true);
                }

                // 정답률을 표현한다.
                const performance = performance_by_class['true'];
                const percentage = Math.round(100 * performance);
                const r = getRadiusByPerformance(performance);
                const cx = x + (CELL_WIDTH / 2);
                const cy = y + (BAR_HEIGHT / 2) + BAR_MARGIN_TOP;

                root.append('circle')
                    .attrs({
                        cx: cx,
                        cy: cy,
                        r: r - CIRCLE_STROKE_WIDTH / 2,
                        fill: '#fff',
                        stroke: CONSTANT.COLORS[model_name],
                        'stroke-width': CIRCLE_STROKE_WIDTH,
                        'stroke-position': 'inside',
                    })
                    .classed('performance-each', true)
                    .classed(model_name, true);
                root.append('text')
                    .text(percentage)
                    .attrs({
                        x: cx,
                        y: cy,
                        'text-anchor': 'middle',
                        'alignment-baseline': 'middle',
                    })
                    .classed('performance-each', true)
                    .classed(model_name, true);

                // 순위 변경선을 그린다.
                const next_digit = digit + 1;
                const next_ranking = digit !== 9 ? ranking_info[next_digit].indexOf(model_name) : ranking;

                ranking_line.push({
                    x: cx - 30,
                    y: cy
                });
                ranking_line.push({
                    x: cx + 30,
                    y: cy
                });
                if (digit !== 9) {
                    ranking_line.push({
                        x: cx + CELL_WIDTH - 30,
                        y: MARGIN_TOP + (next_ranking * CELL_HEIGHT) + (BAR_HEIGHT / 2) + BAR_MARGIN_TOP
                    });
                    ranking_line.push({
                        x: cx + CELL_WIDTH + 30,
                        y: MARGIN_TOP + (next_ranking * CELL_HEIGHT) + (BAR_HEIGHT / 2) + BAR_MARGIN_TOP
                    });
                }
            });

            drawRankingPath(ranking_line, model_name);
            drawHeatMap(spark_line_y, i, model_name);
            drawSparkLine(spark_line_y, i, model_name);
            drawAvgPerformance(spark_line_y, i, model_name);

            // add Interaction
            d3.selectAll('.' + model_name)
                .on("mouseover", function () {
                    mouseOn(model_name);
                })
                .on("mouseout", function () {
                    mouseOut(model_name);
                })
                .on("mousedown", function () {
                    mouseDown(model_name);
                });
        });

        SortSvgObjs();
    }

    function drawRankingPath(lineData, model_name) {
        // This is the accessor function
        let lineBasis = d3.line()
            .x(function (d) {
                return d.x;
            })
            .y(function (d) {
                return d.y;
            })
            .curve(d3.curveMonotoneX); // curveLinear
        root.append('path')
            .attr("d", lineBasis(lineData))
            .attrs({
                fill: 'none',
                stroke: CONSTANT.COLORS[model_name],
                'stroke-width': RANKING_STROKE_WIDTH,
            })
            .classed('ranking-change-line', true)
            .classed('selected', false)
            .classed(model_name, true)
    }

    function drawAvgPerformance(performances_by_class, yi, model_name) {
        const avgPerformance = Processor.getAvgFromJson(performances_by_class);
        const percentage = Math.round(100 * avgPerformance);
        const cx = TEXT_X_END + SPARK_LINE_MARGIN * 3 + SPARK_LINE_INTERVAL * 10;
        let y = yi * CELL_HEIGHT + MARGIN_TOP;
        const cy = y + CELL_HEIGHT / 2;
        const r = getRadiusByPerformance(avgPerformance);

        root.append('circle')
            .attrs({
                cx: cx,
                cy: cy,
                r: r - CIRCLE_STROKE_WIDTH / 2,
                fill: '#fff',
                stroke: CONSTANT.COLORS[model_name],
                'stroke-width': CIRCLE_STROKE_WIDTH,
            })
            .classed("avg-performance", true)
            .classed(model_name, true);

        root.append('text')
            .text(percentage)
            .attrs({
                x: cx,
                y: cy,
                'text-anchor': 'middle',
                'alignment-baseline': 'middle',
            })
            .classed("avg-performance", true)
            .classed(model_name, true);
    }

    function drawSparkLine(scores, yi, model_name) {
        let lineData = [];
        _.forEach(scores, (score, digit) => {
            const redundancy_score = getRedundancy(score, MIN_SCORE);
            const x = (digit * SPARK_LINE_INTERVAL) + (SPARK_LINE_INTERVAL / 2) + TEXT_X_END + SPARK_LINE_MARGIN;
            const y_base = (yi * CELL_HEIGHT) + MARGIN_TOP + BAR_MARGIN_TOP + BAR_HEIGHT;
            const y = y_base - (redundancy_score * BAR_HEIGHT);
            lineData.push({ x, y });
        });

        // This is the accessor function
        let lineBasis = d3.line()
            .x(function (d) {
                return d.x;
            })
            .y(function (d) {
                return d.y;
            })
            .curve(d3.curveLinear); // curveBasis

        // The line SVG Path we draw
        root.append("path")
            .attr("d", lineBasis(lineData))
            .attrs({
                fill: 'none',
                stroke: CONSTANT.COLORS[model_name],
                'stroke-width': SPARK_LINE_WIDTH,
            })
            .classed('spark-line', true)
            .classed(model_name, true)
    }

    function drawHeatMap(scores, yi, model_name) {
        _.forEach(scores, (score, digit) => {
            let color = getHexColorByPerformance(score);
            const x = TEXT_X_END + SPARK_LINE_MARGIN + digit * SPARK_LINE_INTERVAL;
            const y = yi * CELL_HEIGHT + MARGIN_TOP + BAR_MARGIN_TOP;
            root.append('rect')
                .attrs({
                    x: x,
                    y: y,
                    width: SPARK_LINE_INTERVAL,
                    height: BAR_HEIGHT,
                    fill: color,
                    stroke: getHexColorByPerformance(0.7),
                    'stroke-width': 1
                })
                .classed('heat-map', true)
                .classed(model_name, true);
        });

    }

    function SortSvgObjs() {
        root.selectAll('.name-cell-background').raise();
        root.selectAll('.model-name').raise();
        root.selectAll('.ranking-change-line').raise();
        root.selectAll('.performance-each').raise();
        root.selectAll('.heat-map').raise();
        root.selectAll('.spark-line').raise();
        root.selectAll('.avg-performance').raise();
        root.selectAll('text').raise();
    }

    /**
     * criteria 를 기준으로한 클래스별 모델 성능 순위를 돌려줍니다.
     * 반환하는 객체의 key 는 클래스, value 는 성능순 모델명 배열입니다.
     * @param criteria
     * @returns {{}}
     */
    function getRankingInfo(criteria) {
        let ranking_info = {};

        for (let digit = 0; digit < 10; digit++) {
            ranking_info[digit] = [];
            let models_score = [];
            _.forEach(CONSTANT.MODEL_NAMES, (model_name) => {
                models_score.push({
                    model_name,
                    score: models_performance[model_name][digit][criteria]
                });
            });

            models_score = _.sortBy(models_score, [function (o) {
                return 1 - o.score;
            }]);

            _.forEach(models_score, (model_score) => {
                ranking_info[digit].push(model_score['model_name']);
            });

        }
        return ranking_info;
    }

    function mouseOn(hover_model_name) {
        highlightModel(hover_model_name);
    }

    function mouseOut(de_hover_model_name) {
        deHighlightModel(de_hover_model_name);
        highlightModel(selected_model);
    }

    function mouseDown(model_name) {
        selected_model = model_name;
        highlightModel(selected_model);

        const prediction_changes = Processor.getPredictionChangeInfo(model_name);
        Components.MODEL_RANKING_VIS.update(prediction_changes, 'true');
        Components.MODEL_DIAGNOSIS_VIS.updateMatrix(model_name);
    }

    function highlightModel(model_name) {
        const color = CONSTANT.COLORS[model_name];
        root.selectAll('.name-cell-background' + '.' + model_name).style("opacity", 1);
        root.selectAll('.ranking-change-line' + '.' + model_name).style("stroke-width", HEIGHT_RANKING_LINE_HEIGHT);
        root.selectAll('circle' + '.' + model_name).style('stroke', '#000');
        root.selectAll('circle' + '.' + model_name).style('stroke-width', CIRCLE_STROKE_WIDTH * 0.75);
    }

    function deHighlightModel(model_name) {
        const color = CONSTANT.COLORS[model_name];
        root.selectAll('.name-cell-background' + '.' + model_name).style("opacity", 0);
        root.selectAll('.ranking-change-line' + '.' + model_name).style("stroke-width", RANKING_STROKE_WIDTH);
        root.selectAll('circle' + '.' + model_name).style('stroke', color);
        root.selectAll('circle' + '.' + model_name).style('stroke-width', CIRCLE_STROKE_WIDTH);
    }

    function getRadiusByPerformance(performance) {
        const redundancy = getRedundancy(performance, MIN_SCORE);
        return redundancy * MAX_RADIUS;
    }

    function getHexColorByPerformance(performance) {
        // score 0.5 -> black (#000) // score 1 -> white (#fff)
        let redundancy = getRedundancy(performance, MIN_SCORE);

        const color_decimal = Math.round(256 * redundancy);
        let hex = color_decimal.toString(16);
        hex = hex.length > 1 ? hex : '0' + hex;

        return '#' + hex + hex + hex;
    }

    /**
     * min value ~ 1 사이의 값을 0 ~ 1 사이 값으로 변경해준다.
     * @param value
     * @param min_value
     * @returns {number}
     */
    function getRedundancy(value, min_value) {
        let redundancy = value - min_value;
        redundancy = redundancy / (1 - min_value);
        return redundancy;
    }

    function removeAll() {
        d3.selectAll('#model-ranking-vis > *').remove();
    }

    return that;
}

setTimeout(function () {
    // Components.MODEL_RANKING_VIS.update(Processor.getPerformances(CONSTANT.MODEL_NAMES), 'true');
}, 3000);