var allData = [];

$.ajaxSetup({
  async: false,
});

$.ajax({
  url:
    "https://raw.githubusercontent.com/snepal909/A4/master/PlayerDB - Copy.json",
  dataType: "json",
  type: "get",
  cache: false,
  success: function (data) {
    $(data).each(function (index, value) {
      allData.push(value);
    });
    updateGraph(8.5, 4, 17, 35, 0.0, 120.0);
  },
});

function updateGraph(sz, oc, minAge, maxAge, minFee, maxFee) {
  d3.select("#graph").html("");
  d3.select("#leg").html("");
  document
    .getElementById("leg")
    .setAttribute("style", "border:1px solid black");
  var margins = { tp: 50, btm: 50, lft: 90, rt: 70 };
  var setup = Object.keys(allData[0]);
  var xax = setup[2];
  var yax = setup[7];
  var cax = setup[8];
  var dotsize = sz;
  var dotopac = (oc * 1.0) / 10.0;
  var yup = [];
  var leagues = [];
  var colors = [];
  if (document.getElementById("German").checked) {
    leagues.push("1 Bundesliga");
    colors.push("red");
  }
  if (document.getElementById("Italian").checked) {
    leagues.push("Serie A");
    colors.push("orange");
  }
  if (document.getElementById("French").checked) {
    leagues.push("Ligue 1");
    colors.push("yellow");
  }
  if (document.getElementById("Eng1").checked) {
    leagues.push("Premier League");
    colors.push("lime");
  }
  if (document.getElementById("Spanish").checked) {
    leagues.push("Primera Division");
    colors.push("cyan");
  }
  if (document.getElementById("Russ").checked) {
    leagues.push("Premier Liga");
    colors.push("dodgerBlue");
  }
  if (document.getElementById("Portu").checked) {
    leagues.push("Liga Nos");
    colors.push("fuchsia");
  }
  if (document.getElementById("Eng2").checked) {
    leagues.push("Championship");
    colors.push("darkviolet");
  }
  if (document.getElementById("Dutch").checked) {
    leagues.push("Eredivisie");
    colors.push("darkgray");
  }

  var svg = d3.select("#graph");
  var leg = d3.select("#leg");
  svg.style("width", 1000);
  svg.style("height", 700);
  leg.style("width", 135);
  leg.style("height", 25 * leagues.length);
  for (let i = 0; i < allData.length; i++) {
    if (leagues.includes(allData[i].league_name)) {
      if (maxAge >= allData[i].age && allData[i].age >= minAge) {
        if (
          maxFee >= allData[i].fee_cleaned &&
          allData[i].fee_cleaned >= minFee
        ) {
          yup.push(allData[i]);
        }
      }
    }
  }

  if (yup.length == 0) {
    alert(
      "Constraints too Strict! There are no players matching those criteria!"
    );
  }

  var xScale = d3
    .scaleLinear()
    .domain([
      d3.min(yup.map((d) => d[xax])) - 1,
      d3.max(yup.map((d) => d[xax])) + 1,
    ])
    .range([margins.lft, 1000 - margins.rt]);
  svg
    .append("g")
    .attr("transform", "translate(0, 650)")
    .call(d3.axisBottom(xScale));

  var yScale = d3
    .scaleLinear()
    .domain([
      d3.min(yup.map((d) => d[yax])) - 5,
      d3.max(yup.map((d) => d[yax] + 10 - (d[yax] % 10))),
    ])
    .range([700 - margins.btm, margins.tp]);
  svg
    .append("g")
    .attr("transform", "translate(90, 0)")
    .call(d3.axisLeft(yScale));

  var cScale = d3.scaleOrdinal().domain(leagues).range(colors);

  leg
    .selectAll("mydots")
    .data(leagues)
    .enter()
    .append("circle")
    .attr("cx", 10)
    .attr("cy", function (d, i) {
      return 12.5 + i * 25;
    })
    .attr("r", 6)
    .style("fill", function (d) {
      return cScale(d);
    })
    .style("opacity", dotopac);

  leg
    .selectAll("mylabels")
    .data(leagues)
    .enter()
    .append("text")
    .attr("x", 25)
    .attr("y", function (d, i) {
      return 12.5 + i * 25;
    })
    .style("fill", function (d) {
      return d;
    })
    .text(function (d) {
      return d;
    })
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle");

  var tooltip = d3
    .select("body")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip");

  var mouseover = function (d) {
    tooltip.style("opacity", 1);
    tooltip.html(
      "Name: " +
        d.player_name +
        "<br/><br/> Age: " +
        d.age +
        "<br/><br/> Position: " +
        d.position +
        "<br/><br/> Joined: " +
        d.club_name +
        "<br/><br/> Left: " +
        d.club_involved_name +
        "<br/><br/> Transfer Fee: £" +
        d.fee_cleaned +
        "m"
    );
    tooltip
      .style("left", d3.event.pageX + 40 + "px")
      .style("top", d3.event.pageY - 60 + "px");
  };

  var mouseleave = function (d) {
    tooltip.transition().duration(350).style("opacity", 0);
  };

  svg
    .selectAll("circle")
    .data(yup)
    .enter()
    .append("circle")
    .attr("cx", function (d) {
      return xScale(d[xax]);
    })
    .attr("cy", function (d) {
      return yScale(d[yax]);
    })
    .attr("r", dotsize)
    .style("fill", function (d) {
      return cScale(d[cax]);
    })
    .style("fill-opacity", dotopac)
    .on("mouseover", mouseover)
    .on("mouseleave", mouseleave);

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 40)
    .attr("x", 0 - 335)
    .style("text-anchor", "middle")
    .text("Transfer Fee (Millions in Pounds)");
  svg
    .append("text")
    .attr("y", 695)
    .attr("x", 490 + margins.lft - margins.rt)
    .style("text-anchor", "middle")
    .text("Player Age");
  svg
    .append("text")
    .attr("y", margins.tp / 2)
    .attr("x", 490 + margins.lft - margins.rt)
    .style("text-anchor", "middle")
    .style("font-size", "24px")
    .style("font-weight", "bold")
    .text("Incoming Paid Transfers of Top European Soccer Clubs in 2019");

  d3.select("#minag").on("change", function (d) {
    selected = this.value;
    if (selected < maxAge) {
      updateGraph(dotsize, dotopac * 10.0, selected, maxAge, minFee, maxFee);
    } else {
      alert("Minimum age must be less than maximum age!");
      this.value = minAge;
    }
  });
  d3.select("#maxag").on("change", function (d) {
    selected = this.value;
    if (selected > minAge) {
      updateGraph(dotsize, dotopac * 10.0, minAge, selected, minFee, maxFee);
    } else {
      alert("Minimum age must be less than maximum age!");
      this.value = maxAge;
    }
  });
  d3.select("#minf").on("change", function (d) {
    selected = this.value * 1.0;
    if (selected < maxFee) {
      updateGraph(dotsize, dotopac * 10.0, minAge, maxAge, selected, maxFee);
    } else {
      alert("Minimum fee must be less than maximum fee!");
      this.value = minFee;
    }
  });
  d3.select("#maxf").on("change", function (d) {
    selected = this.value * 1.0;
    if (selected > minFee) {
      updateGraph(dotsize, dotopac * 10.0, minAge, maxAge, minFee, selected);
    } else {
      alert("Minimum fee must be less than maximum fee!");
      this.value = maxFee;
    }
  });
  d3.select("#size").on("change", function (d) {
    selected = this.value;
    updateGraph(selected, dotopac * 10.0, minAge, maxAge, minFee, maxFee);
  });
  d3.select("#opac").on("change", function (d) {
    selected = this.value;
    updateGraph(dotsize, selected, minAge, maxAge, minFee, maxFee);
  });
  d3.select("#German").on("click", function (d) {
    if ($("#tools input:checkbox:checked").length == 0) {
      alert("Must pick at least one league!");
      this.checked = true;
    } else {
      updateGraph(dotsize, dotopac * 10, minAge, maxAge, minFee, maxFee);
    }
  });
  d3.select("#French").on("click", function (d) {
    if ($("#tools input:checkbox:checked").length == 0) {
      alert("Must pick at least one league!");
      this.checked = true;
    } else {
      updateGraph(dotsize, dotopac * 10, minAge, maxAge, minFee, maxFee);
    }
  });
  d3.select("#Spanish").on("click", function (d) {
    if ($("#tools input:checkbox:checked").length == 0) {
      alert("Must pick at least one league!");
      this.checked = true;
    } else {
      updateGraph(dotsize, dotopac * 10, minAge, maxAge, minFee, maxFee);
    }
  });
  d3.select("#Italian").on("click", function (d) {
    if ($("#tools input:checkbox:checked").length == 0) {
      alert("Must pick at least one league!");
      this.checked = true;
    } else {
      updateGraph(dotsize, dotopac * 10, minAge, maxAge, minFee, maxFee);
    }
  });
  d3.select("#Eng1").on("click", function (d) {
    if ($("#tools input:checkbox:checked").length == 0) {
      alert("Must pick at least one league!");
      this.checked = true;
    } else {
      updateGraph(dotsize, dotopac * 10, minAge, maxAge, minFee, maxFee);
    }
  });
  d3.select("#Eng2").on("click", function (d) {
    if ($("#tools input:checkbox:checked").length == 0) {
      alert("Must pick at least one league!");
      this.checked = true;
    } else {
      updateGraph(dotsize, dotopac * 10, minAge, maxAge, minFee, maxFee);
    }
  });
  d3.select("#Russ").on("click", function (d) {
    if ($("#tools input:checkbox:checked").length == 0) {
      alert("Must pick at least one league!");
      this.checked = true;
    } else {
      updateGraph(dotsize, dotopac * 10, minAge, maxAge, minFee, maxFee);
    }
  });
  d3.select("#Portu").on("click", function (d) {
    if ($("#tools input:checkbox:checked").length == 0) {
      alert("Must pick at least one league!");
      this.checked = true;
    } else {
      updateGraph(dotsize, dotopac * 10, minAge, maxAge, minFee, maxFee);
    }
  });
  d3.select("#Dutch").on("click", function (d) {
    if ($("#tools input:checkbox:checked").length == 0) {
      alert("Must pick at least one league!");
      this.checked = true;
    } else {
      updateGraph(dotsize, dotopac * 10, minAge, maxAge, minFee, maxFee);
    }
  });
}
