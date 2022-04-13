#ifdef GL_ES
precision mediump float;
#endif

#define THEME_SIZE 6

uniform float u_time;
uniform float width;
uniform float height;
uniform sampler2D cam;
uniform vec2 objects[THEME_SIZE];

vec3 color_0 = vec3(1.0, 0.0, 0.0);
vec3 color_1 = vec3(1.0, 1.0, 0.0);
vec3 color_2 = vec3(0.0, 1.0, 0.0);
vec3 color_3 = vec3(0.0, 1.0, 1.0);
vec3 color_4 = vec3(0.0, 0.0, 1.0);
vec3 color_5 = vec3(1.0, 0.0, 1.0);
vec3 theme[THEME_SIZE];

vec3 color = color_0;

float map(float x, float in_min, float in_max, float out_min, float out_max) {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

int classify_color(vec3 c) {
    float c_angle = c.x;
    int closest_index = 0;
    vec3 closest_color = theme[0];
    for (int i = 0; i < THEME_SIZE; i++) {
        if (i == closest_index) continue;
        vec3 current_color = rgb2hsv(theme[i]);
        float current_angle = current_color.x;
        float closest_angle = closest_color.x;
        // Distance between given color and current_color
        float d1 = abs(c_angle - current_angle);
        // Distance between given color and closest_color
        float d2 = abs(c_angle - closest_angle);
        if (d1 <= d2) {
            closest_index = i;
            closest_color = current_color;
        }
    }
    return closest_index;
}

void main(void) {
  // CREATE THEME
  theme[0] = color_0;
  theme[1] = color_1;
  theme[2] = color_2;
  theme[3] = color_3;
  theme[4] = color_4;
  theme[5] = color_5;

  // SETTING UP U_VARIABLES
  vec2 u_resolution = vec2(width, height);
  // NORMILIZED VARIABLES
  vec2 p = gl_FragCoord.xy / u_resolution.xy;
  p.y = 1.0 - p.y;
  p.x = 1.0 - p.x;

  // COLOR UNDER THE MOUSE
  color = texture2D(cam, p).rgb;

  int i = classify_color(rgb2hsv(color));
  if (i == 0) color = theme[0];
  if (i == 1) color = theme[1];
  if (i == 2) color = theme[2];
  if (i == 3) color = theme[3];
  if (i == 4) color = theme[4];
  if (i == 5) color = theme[5];

  gl_FragColor = vec4(color, 1.0);
}
