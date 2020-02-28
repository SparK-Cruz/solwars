(function(){
    var canvas = document.getElementById("main");
    var gl = canvas.getContext("webgl2");

    function vertexShaderCode() {
        return `
            attribute vec2 a_position;
            attribute vec2 a_texCoord;

            varying vec2 v_texCoord;
            void main() {
                gl_Position = vec4(a_position, 1.0, 1.0);
                v_texCoord = a_texCoord;
            }
        `;
    }

    function fragmentShaderCode() {
        return `
            precision mediump float;

            uniform sampler2D u_image;
            varying vec2 v_texCoord;

            void main() {
                gl_FragColor = texture2D(u_image, v_texCoord);
            }
        `;
    }

    function render() {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.flush();
    }

    function compileShader(code, type) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, code);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error("Shader error: \n" + gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

    render();
})();
