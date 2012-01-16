#pp header

#pp order 750
#pp entry plight_f
void plight_f(inout vec4 res);

#pp main

varying vec3 plight_pos;
varying vec3 plight_nrm;
varying vec4 pslight_stc;

uniform int nlights, pslight_sl;
uniform sampler2D pslight_map;

void dolight(int i, vec3 norm, vec3 edir, float shadow, inout vec3 diff, inout vec3 spec)
{
    if(gl_LightSource[i].position.w == 0.0) {
	diff += gl_FrontMaterial.ambient.rgb * gl_LightSource[i].ambient.rgb;
	vec3 dir = gl_LightSource[i].position.xyz;
	float df = max(dot(norm, dir), 0.0);
	if(i == pslight_sl)
	    df *= shadow;
	if(df > 0.0) {
	    diff += gl_FrontMaterial.diffuse.rgb * gl_LightSource[i].diffuse.rgb * df;
	    if(gl_FrontMaterial.shininess > 0.5) {
		spec += gl_FrontMaterial.specular.rgb * gl_LightSource[i].specular.rgb *
		    pow(max(dot(edir, reflect(-dir, norm)), 0.0), gl_FrontMaterial.shininess);
	    }
	}
    } else {
	vec3 rel = gl_LightSource[i].position.xyz - plight_pos.xyz;
	vec3 dir = normalize(rel);
	float dist = length(rel);
	float att = 1.0 / (gl_LightSource[i].constantAttenuation
			   + (gl_LightSource[i].linearAttenuation * dist)
			   + (gl_LightSource[i].quadraticAttenuation * dist * dist));
	diff += gl_FrontMaterial.ambient.rgb * gl_LightSource[i].ambient.rgb * att;
	float df = max(dot(norm, dir), 0.0);
	if(i == pslight_sl)
	    df *= shadow;
	if(df > 0.0) {
	    diff += gl_FrontMaterial.diffuse.rgb * gl_LightSource[i].diffuse.rgb * df * att;
	    if(gl_FrontMaterial.shininess > 0.5) {
		spec += gl_FrontMaterial.specular.rgb * gl_LightSource[i].specular.rgb * att *
		    pow(max(dot(edir, reflect(-dir, norm)), 0.0), gl_FrontMaterial.shininess);
	    }
	}
    }
}

void plight_f(inout vec4 res)
{
    vec3 barda = pslight_stc.xyz / pslight_stc.w;
    float sd = texture2D(pslight_map, barda.xy).z;
    float sdw = 0.0;
    if((sd + 0.0005) > barda.z)
	sdw = 1.0;
    
    vec3 norm = normalize(plight_nrm);
    vec3 edir;
    if(gl_FrontMaterial.shininess > 0.5)
	edir = normalize(-plight_pos.xyz);
    vec3 diff = gl_FrontMaterial.emission.rgb;
    vec3 spec = vec3(0.0, 0.0, 0.0);
    if(nlights > 0)
	dolight(0, norm, edir, sdw, diff, spec);
    if(nlights > 1)
	dolight(1, norm, edir, sdw, diff, spec);
    if(nlights > 2)
	dolight(2, norm, edir, sdw, diff, spec);
    if(nlights > 3)
	dolight(3, norm, edir, sdw, diff, spec);
    res *= vec4(diff, gl_FrontMaterial.diffuse.a);
    res += vec4(spec, 0.0);
}
