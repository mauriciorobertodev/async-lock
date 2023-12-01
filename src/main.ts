import StudioState from "./studio-state";

(function run() {
	const promises : Promise<any>[] = [];

	for (let i = 0; i < 50; i++) {
		promises.push(
			StudioState.getState('gameSpeed').then((value) => console.log('atual:', value)),
	StudioState.setGameSpeed((old) => old + 1),
		);
	}

	promises.sort(() => Math.random() - 0.5)

	Promise.all(promises);
})()


