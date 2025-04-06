// STEP 1: Create the main program asynchronous function
async function startProgram() {
	// STEP 2: Instruct the main LED light with rgb (using object notation)
	setMainLed({ r: 100, g: 50, b: 255 });
	// STEP 3: Text-to-speech
	await speak("COMP2144 Extended Reality and Emerging Technologies", true);
	// STEP 4: Wait for a short period of time
	await delay(1);
	// STEP 5: Construct a loop that will iterate 4 times
	for (var i = 0; i < 4; i++) {
		// STEP 6: Set the main LED light to a random color
		setMainLed(getRandomColor());
		// STEP 7: Play a fun random sound
		await Sound.play(true);
		// STEP 8: Use the LCD display screen
		await setDisplayImage("slightly-smiling");
		// STEP 9: Turn 90 degrees, then roll at speed 0-255, for 1 second
		await roll((getHeading() + 90), 30, 1);
		// STEP 10: Announce the current navigational heading in degrees
		await speak("My heading is " + getHeading(), true);
		// STEP 11: Take a one second break
		await delay(1);
	}
	// STEP 12: Say how far the robot has travelled (in cm)
	await speak("I have travelled " + getDistance() + " centimeters", true);
}