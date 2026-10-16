using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine.SceneManagement;
using System.IO;

public static class KelplantisBuild
{
    public static void BuildWindows()
    {
        KelplantisSceneFactory.CreateScene();
        string scenePath = "Assets/Scenes/Kelplantis.unity";
        Directory.CreateDirectory("Assets/Scenes");
        EditorSceneManager.SaveScene(SceneManager.GetActiveScene(), scenePath);
        Directory.CreateDirectory("Builds/Kelplantis");
        var report = BuildPipeline.BuildPlayer(new BuildPlayerOptions {
            scenes = new[] { scenePath },
            locationPathName = "Builds/Kelplantis/Kelplantis.exe",
            target = BuildTarget.StandaloneWindows64,
            options = BuildOptions.None
        });
        if (report.summary.result != UnityEditor.Build.Reporting.BuildResult.Succeeded) throw new System.Exception("GAME-TARGET-001 build failed: " + report.summary.result);
        Debug.Log("GAME-TARGET-001 WINDOWS BUILD PASS");
    }
}
