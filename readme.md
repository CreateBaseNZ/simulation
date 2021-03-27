# Workflow
1. In the terminal use "npm install" to install dependancies.
2. Use "npm run start" to start the local server. Default is localhost:8000. The first time compiling might take around 5 minutes.
3. Place blender glb assets inside the "assets" folder.
4. In a new terminal navigate to the assets folder and run "npx serve --cors" to host the assets on a local server.
5. In src/scenes create new scenes as functions.
6. To load the scene pass the created function through the "LoadScene" function called inside of the GameManager class.
7. In the SceneManager class, the function "CreateEnvironment" sets up all of the components present in ALL scenes.