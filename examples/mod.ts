import { Timestep } from "timestep";
import { Integrator } from "./integrator.js";

const canvas = document.querySelector("canvas");
const integrator = new Integrator(canvas);

const timestep = new Timestep({ integrator, msInterval: 10 });

timestep.start();
setTimeout(function () {
	timestep.stop();
}, 5000);
