
export const map = { };
map["0,0"] = "lehm";
map["1,0"] = "lehm";
map["2,0"] = "lehm";

map["1,1"] = "energy";
map["2,1"] = "energy";

map["1,3"] = "garden";
map["2,3"] = "garden";
map["3,3"] = "garden";
map["4,3"] = "garden";

map["2,4"] = "rannara"; // rakete
map["3,4"] = "human-house";
map["4,4"] = "human-house";

map["4,5"] = "water-tank";
map["5,5"] = "water-tank";
map["6,5"] = "water-tank";

const cost = {
	"water-tank": {
		"metal": 8,
		"energy": 3,
	},
	"garden": {
		"glass": 150,
		"energy": 25,
		"biomass": 50,
	},
	"human-house": {
		"bricks": 200,
	},
	"spaceship-site": null,
	"garage": {
		"metal": 20,
		"energy": 15,
		"glass": 10,
	},
};

export
async function show () {
	// ctx is the canvas context.
	var ctx = $("#mars-map")[0].getContext("2d");

	// draw the background.
	drawBackground();

	// draw the biomes.
	drawBiomes();

	// hide over view
	$("#over").css("display", "none");
	$("#close").on("click", function() {
		changeScene("map");
	})

	// install the onclick handler (left/right click)
	var r = null;
	var biome = null;

	$(ctx.canvas).on("click", function (e) {
		// first, find out the biome that was clicked on.
		var offX  = (e.offsetX || e.pageX - $(e.target).offset().left);
		var offY  = (e.offsetY || e.pageY - $(e.target).offset().top );
		var {width, height} = e.target.getBoundingClientRect();
		var i = Math.floor(offX / width  * 8);
		var j = Math.floor(offY / height * 8);
		console.log("i j", i, j);
		r = `${i},${j}`;
		biome = map[r];
		// navigate to that biome
		if (biome) changeScene(biome);
		else changeScene("map");
	});

	$(ctx.canvas).on("contextmenu", function (e) {
		e.preventDefault();

		// first, find out the biome that was clicked on.
		var offX  = (e.offsetX || e.pageX - $(e.target).offset().left);
		var offY  = (e.offsetY || e.pageY - $(e.target).offset().top );
		var {width, height} = e.target.getBoundingClientRect();
		var i = Math.floor(offX / width  * 8);
		var j = Math.floor(offY / height * 8);
		console.log("i j", i, j);
		r = `${i},${j}`;
		biome = map[r];

		// highlight the chosen biome a bit.
		drawBackground();
		drawBiomes();
		ctx.strokeRect(80*i + 2, 80*j + 2, 76, 76);

		// display information about the biome.
		// in a modal window
		$("#over")
			.css("display", "block");
		$("#info")
			.html(`Ort: ${r}\nBiome: ${biome || "Empty"}\n\n&nbsp;`);
		if (biome) {
			$('#build')
				.css("display", "none");
			$('#reset')
				.css("display", "block")
				.on("click", function() {

				});
		} else {
			$('#reset')
				.css("display", "none");
			$('#build')
				.css("display", "block")
		}
	})
	// install onclick handlers for the over view
	$("#reset").on("click", function() {
		if (confirm("Reset biome?"))
			map[r] = null;
			changeScene("map");
	})
	$("#build select").on("change", function(e) {
		console.log("Change", e.target.value);
		// in the future, don't show build costs anymore.
		// instead, a limited number of instances can be built
		// from the resources of a single ship.
		$("#build-cost").text(`Will cost:\n`);
		var c = cost[e.target.value] || { };
		for (let i in c) {
			$("#build-cost").append(`${i}: ${c[i]}\n`);
		}
	});
	$("#build input[type=button]").on("click", function() {
		var biome = $("#build select").val();
		console.log("Selected value:", biome);
		map[r] = biome;
		changeScene("map");
	});
}

export
const backgroundImage = await loadImage("/scene/map-1.png");

export
async function loadImage (url) {
	let img = $("<img>").attr("src", url);
	return new Promise((f, r) => {
		img.on("load", () => f(img[0]));
		img.on("error", err => r(err));
	})
}

function drawBackground() {
	var ctx = $("#mars-map")[0].getContext("2d");
	ctx.canvas.width  = 640;
	ctx.canvas.height = 640;
	ctx.clearRect(0, 0, 640, 640);
	//ctx.fillStyle = "#945717";
	//ctx.fillRect(0, 0, 640, 640);
	let img = backgroundImage;
	ctx.drawImage(img, 0, 0);
}

const css_images = {
	"lehm"       : "/scene/lehm.png",
	"water-tank" : "/scene/map-water-tank-1.png",
	"garden"     : "/scene/map-garden.png",
	"human-house": "/scene/map-human-house-2.gif",
	"energy"     : "/scene/inventory-solar-cells-1.png",
	"rannara"    : "/scene/rocket-launch.jpg",
};

const css_image_cache = { };
await Promise.all(Object.keys(css_images).map(key => new Promise((f, r) =>
	$(`<img src="${css_images[key]}">`).on("load", function () {
		css_image_cache[key] = this;
		f();
	})
)));

function drawBiomes() {
	var ctx = $("#mars-map")[0].getContext("2d");
	for (let i = 0; i < 8; i++) {
		for (let j = 0; j < 8; j++) {
			ctx.strokeRect(80*i, 80*j, 80, 80);
			var key = `${i},${j}`;
			var biome = null;
			var img = null;
			if (key in map) biome = map[key];
			if (biome in css_image_cache) img = css_image_cache[biome];
			if (img) ctx.drawImage(img, 80*i, 80*j, 80, 80);
		}
	}
}
