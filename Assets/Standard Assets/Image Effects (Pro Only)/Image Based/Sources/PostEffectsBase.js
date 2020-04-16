
@script ExecuteInEditMode
@script RequireComponent (Camera)

class PostEffectsBase extends MonoBehaviour 
{	
	public var order : int = 0;
	
	function CheckShader(s : Shader) : boolean {
		if(!s.isSupported) {
			ReportNotSupported ();
			return false;
		}
		else
			return true;
	}

	function Start () {
		CheckSupport();
	}
	
	function CheckSupport() : boolean {
		// Disable if we don't support image effectsor render textures
		if (!SystemInfo.supportsImageEffects || !SystemInfo.supportsRenderTextures) {
			// Debug.LogError ("Image effects or render textures are not supported.");
			ReportNotSupported ();
			return false;
		}		
		return true;
	}
	
	function ReportNotSupported () {
		//Debug.LogError ("The image effect is not supported on this platform!");
		enabled = false;
		return;
	}
	    
	function OnRenderImage2 (source : RenderTexture, destination : RenderTexture) {
	}
	function OnRenderImage3 (sourceAndDestination : RenderTexture, temp : RenderTexture) {
	}
    function PreferRenderImage3() : boolean { return false; }
	
	function DrawLowLevelPlaneAlignedWithCamera(
		dist : float,
		source : RenderTexture, dest : RenderTexture, 
		material : Material, 
		cameraForProjectionMatrix : Camera )
	{
        // Make the destination texture the target for all rendering
        RenderTexture.active = dest;
        // Assign the source texture to a property from a shader
        material.SetTexture("_MainTex", source);
        var invertY : boolean = true; // source.texelSize.y < 0.0f;
        // Set up the simple Matrix
        GL.PushMatrix();
        GL.LoadIdentity();	
        GL.LoadProjectionMatrix(cameraForProjectionMatrix.projectionMatrix);
        
        var fovYHalfRad : float = cameraForProjectionMatrix.fieldOfView * 0.5 * Mathf.Deg2Rad;
        var cotangent : float = Mathf.Cos(fovYHalfRad) / Mathf.Sin(fovYHalfRad);
        var asp : float = cameraForProjectionMatrix.aspect;
        
        var x1 : float = asp/-cotangent;
        var x2 : float = asp/cotangent;
        var y1 : float = 1.0/-cotangent;
        var y2 : float = 1.0/cotangent;
        
        var sc : float = 1.0; // magic constant (for now)
        
        x1 *= dist * sc;
        x2 *= dist * sc;
        y1 *= dist * sc;
        y2 *= dist * sc;
                
        var z1 : float = -dist;
        
        for (var i : int = 0; i < material.passCount; i++)
        {
            material.SetPass(i);

	        GL.Begin(GL.QUADS);
	        var y1_ : float; var y2_ : float;
	        if (invertY)
	        {
	            y1_ = 1.0; y2_ = 0.0;
	        }
	        else
	        {
	            y1_ = 0.0; y2_ = 1.0;
	        }
	        GL.TexCoord2(0.0, y1_); GL.Vertex3(x1, y1, z1);
	        GL.TexCoord2(1.0, y1_); GL.Vertex3(x2, y1, z1);
	        GL.TexCoord2(1.0, y2_); GL.Vertex3(x2, y2, z1);
	        GL.TexCoord2(0.0, y2_); GL.Vertex3(x1, y2, z1);
	        GL.End();	
        }	
        
        GL.PopMatrix();        
	}
	
	function DrawBorder (
		dest : RenderTexture, 
		material : Material )
	{
		var x1 : float;	
		var x2 : float;
		var y1 : float;
		var y2 : float;		
		
		RenderTexture.active = dest;
        var invertY : boolean = true; // source.texelSize.y < 0.0f;
        // Set up the simple Matrix
        GL.PushMatrix();
        GL.LoadOrtho();		
        
        for (var i : int = 0; i < material.passCount; i++)
        {
            material.SetPass(i);
	        
	        var y1_ : float; var y2_ : float;
	        if (invertY)
	        {
	            y1_ = 1.0; y2_ = 0.0;
	        }
	        else
	        {
	            y1_ = 0.0; y2_ = 1.0;
	        }
	        	        
	        // left	        
	        x1 = 0.0;
	        x2 = 0.0 + 1.0/(dest.width*1.0);
	        y1 = 0.0;
	        y2 = 1.0;
	        GL.Begin(GL.QUADS);
	        
	        GL.TexCoord2(0.0, y1_); GL.Vertex3(x1, y1, 0.1);
	        GL.TexCoord2(1.0, y1_); GL.Vertex3(x2, y1, 0.1);
	        GL.TexCoord2(1.0, y2_); GL.Vertex3(x2, y2, 0.1);
	        GL.TexCoord2(0.0, y2_); GL.Vertex3(x1, y2, 0.1);
	
	        // right
	        x1 = 1.0 - 1.0/(dest.width*1.0);
	        x2 = 1.0;
	        y1 = 0.0;
	        y2 = 1.0;

	        GL.TexCoord2(0.0, y1_); GL.Vertex3(x1, y1, 0.1);
	        GL.TexCoord2(1.0, y1_); GL.Vertex3(x2, y1, 0.1);
	        GL.TexCoord2(1.0, y2_); GL.Vertex3(x2, y2, 0.1);
	        GL.TexCoord2(0.0, y2_); GL.Vertex3(x1, y2, 0.1);	        
	
	        // top
	        x1 = 0.0;
	        x2 = 1.0;
	        y1 = 0.0;
	        y2 = 0.0 + 1.0/(dest.height*1.0);

	        GL.TexCoord2(0.0, y1_); GL.Vertex3(x1, y1, 0.1);
	        GL.TexCoord2(1.0, y1_); GL.Vertex3(x2, y1, 0.1);
	        GL.TexCoord2(1.0, y2_); GL.Vertex3(x2, y2, 0.1);
	        GL.TexCoord2(0.0, y2_); GL.Vertex3(x1, y2, 0.1);
	        
	        // bottom
	        x1 = 0.0;
	        x2 = 1.0;
	        y1 = 1.0 - 1.0/(dest.height*1.0);
	        y2 = 1.0;

	        GL.TexCoord2(0.0, y1_); GL.Vertex3(x1, y1, 0.1);
	        GL.TexCoord2(1.0, y1_); GL.Vertex3(x2, y1, 0.1);
	        GL.TexCoord2(1.0, y2_); GL.Vertex3(x2, y2, 0.1);
	        GL.TexCoord2(0.0, y2_); GL.Vertex3(x1, y2, 0.1);	
	                	              
	        GL.End();	
        }	
        
        GL.PopMatrix();
	}
	
	function DrawLowLevelQuad( x1 : float, x2 : float, y1 : float, y2 : float, source : RenderTexture, dest : RenderTexture, material : Material ) 
	{
        // Make the destination texture the target for all rendering
        RenderTexture.active = dest;
        // Assign the source texture to a property from a shader
        material.SetTexture("_MainTex", source);
        var invertY : boolean = true; // source.texelSize.y < 0.0f;
        // Set up the simple Matrix
        GL.PushMatrix();
        GL.LoadOrtho();

        for (var i : int = 0; i < material.passCount; i++)
        {
            material.SetPass(i);

	        GL.Begin(GL.QUADS);
	        var y1_ : float; var y2_ : float;
	        if (invertY)
	        {
	            y1_ = 1.0; y2_ = 0.0;
	        }
	        else
	        {
	            y1_ = 0.0; y2_ = 1.0;
	        }
	        GL.TexCoord2(0.0, y1_); GL.Vertex3(x1, y1, 0.1);
	        GL.TexCoord2(1.0, y1_); GL.Vertex3(x2, y1, 0.1);
	        GL.TexCoord2(1.0, y2_); GL.Vertex3(x2, y2, 0.1);
	        GL.TexCoord2(0.0, y2_); GL.Vertex3(x1, y2, 0.1);
	        GL.End();	
        }	
        
        GL.PopMatrix();
	}
}