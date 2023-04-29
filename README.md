# IS F311: Computer Graphics WebGL Assignment


# Aim: 
The objective of this assignment is to use WebGL to create the 3D model of the frog skeleton and animate its movements using hierarchical modelling, along with programming simple shaders for lighting and shading. You are expected to include all the components/features mentioned in the specifications section.

# Specifications:
- Create an animation of a frog skeleton using hierarchical modelling in WebGL. You are allowed to use a pre-existing 3D model of a frog skeleton created in Blender. The model should include all the major bones of the frog's skeleton, including the skull, vertebral column, ribs, and limbs. Use basic geometric shapes such as cubes and cylinders to represent the bones.

- Implement basic transformations such as rotation, translation, and scaling to position and animate the bones of the frog's skeleton. The animation should be basic, such as simulating the movement of the limbs or the flexing of the vertebral column.

- Implement a basic shader that adds simple lighting and shading effects to the model. The shader should include a vertex shader that transforms each vertex of the model, and a fragment shader that calculates the colour of each pixel based on basic lighting and shading information.

- The final model should be viewable in a web browser and must be interactive, allowing the user to rotate and zoom in on the model.

- The arrow keys should translate the skeleton in the corresponding direction.

- Holding down shift while using the arrow keys should rotate the skeleton along the corresponding direction. Eg. holding down the front arrow key should make the skeleton tilt away from the screen, holding the right arrow key should make the skeleton tilt to the right etc.
- The J key should make the frog skeleton jump forward
- The S key should make the frog skeleton swim
- W should make the front legs extend forward, A should make the frog look left, S should make the back legs extend backward, and D should make the frog look right.
- Document the process of creating the model and the shader, and write a short report that describes the challenges faced during the project, the techniques used to overcome these challenges, and the results achieved.

## Bonus Credit: 
Add additional details to the model, such as muscles, tendons, or other anatomical structures. Also add animations such as jumping or swimming, and improve the shader to add more realistic lighting and shading effects to the model, such as Phong shading, if time allows.

## Note:
- This is a group assignment, and the team for this assignment remains the same as for the game project.
- Pay close attention to the overall quality and presentation of the final model, including code organisation and commenting.
- You can build and test the WebGL model in a web browser. Most modern web browsers like Chrome, Safari, Firefox and Edge support WebGL.
- To build and test the WebGL models, create an HTML file that contains the necessary JavaScript code to create and render the 3D scene using WebGL. Then open the HTML file in a web browser.
- Focus on creating a simple, but accurate representation of the frog skeleton first, rather than trying to create a highly detailed model.
### A few resources you can use to get started with WebGL programming are given:- 
- http://www.webglacademy.com/
- https://webglfundamentals.org
- https://threejs.org
- WebGL Programming Guide - Matsuda & Lea
- The code and report submission deadline is May 03, 2023

## Evaluation
The assignment will be evaluated based on the following criteria:
- Completeness of the model and its accuracy in representing the structure and movement of a frog's skeleton (40%)
- Quality and complexity of the implemented shaders (40%)
- Quality and clarity of the written report (20%)
