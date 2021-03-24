# To convert from fbx to glb
.\fbx2gltf --input ./assets/Arm1.fbx --output ./assets/Arm1.glb

# To convert from obj to glb
obj2gltf -i ./assets/BaseBottom.obj -o ./assets/BaseBottom.glb
obj2gltf -i ./assets/BaseLid.obj -o ./assets/BaseLid.glb
obj2gltf -i ./assets/Arm1.obj -o ./assets/Arm1.glb
obj2gltf -i ./assets/Arm2.obj -o ./assets/Arm2.glb
obj2gltf -i ./assets/Arm3.obj -o ./assets/Arm3.glb
obj2gltf -i ./assets/Star.obj -o ./assets/Star.glb



# To create server for files
npx serve@6.5.8 --cors