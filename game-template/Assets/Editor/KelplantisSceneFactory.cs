using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEditor;

public static class KelplantisSceneFactory
{
    public static void CreateScene()
    {
        SceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
        var game = new GameObject("KelplantisGame"); game.AddComponent<KelplantisGame>();
        MakeGround("HavenTown", new Vector3(0, -0.25f, 0), new Vector3(24, 0.5f, 24));
        MakeGround("DungeonFloor", new Vector3(0, -0.25f, 30), new Vector3(70, 0.5f, 38));
        MakeTownMarker();

        var player = MakeActor("Hero", PrimitiveType.Capsule, new Vector3(0, 0.8f, 0), new Color(0.2f, 0.7f, 1f));
        player.AddComponent<KelplantisPlayer>();
        MakeRoleTarget("Tank", CombatRole.Tank, new Vector3(-3, 0.8f, 3), new Color(0.3f, 0.5f, 0.9f), 3);
        MakeRoleTarget("Healer", CombatRole.Healer, new Vector3(3, 0.8f, 3), new Color(0.5f, 1f, 0.5f), 1);
        MakeRoleTarget("DamageAlly", CombatRole.Damage, new Vector3(0, 0.8f, 5), new Color(1f, 0.5f, 0.2f), 2);
        for (int i = 0; i < 12; i++) { int type = i % 3; SpawnEnemy(type, new Vector3(-22 + (i % 4) * 14, 0.8f, 22 + (i / 4) * 9)); }
        SpawnEnemy(2, new Vector3(0, 0.8f, 52), true);

        var cam = new GameObject("Main Camera"); cam.tag = "MainCamera"; var c = cam.AddComponent<Camera>(); c.orthographic = true; c.orthographicSize = 12; cam.transform.position = new Vector3(0, 16, -11); cam.transform.rotation = Quaternion.Euler(55, 0, 0);
        var light = new GameObject("Sun"); var dl = light.AddComponent<Light>(); dl.type = LightType.Directional; dl.intensity = 1.1f; light.transform.rotation = Quaternion.Euler(50, -30, 0);
        EditorSceneManager.MarkSceneDirty(SceneManager.GetActiveScene());
    }

    static GameObject MakeActor(string name, PrimitiveType type, Vector3 pos, Color color) { var go = GameObject.CreatePrimitive(type); go.name = name; go.transform.position = pos; go.GetComponent<Renderer>().material.color = color; return go; }
    static void MakeGround(string name, Vector3 pos, Vector3 scale) { var go = GameObject.CreatePrimitive(PrimitiveType.Cube); go.name = name; go.transform.position = pos; go.transform.localScale = scale; go.GetComponent<Renderer>().material.color = new Color(0.12f, 0.16f, 0.12f); }
    static void MakeTownMarker() { var go = GameObject.CreatePrimitive(PrimitiveType.Cylinder); go.name = "TownBeacon"; go.transform.position = new Vector3(0, 0.25f, 8); go.transform.localScale = new Vector3(3, 0.25f, 3); go.GetComponent<Renderer>().material.color = new Color(0.2f, 0.8f, 0.4f); }
    static void MakeRoleTarget(string name, CombatRole role, Vector3 pos, Color color, int priority) { var go = MakeActor(name, PrimitiveType.Capsule, pos, color); var rt = go.AddComponent<KelplantisRoleTarget>(); rt.Role = role; rt.Priority = priority; }
    static void SpawnEnemy(int type, Vector3 pos, bool boss = false)
    {
        var go = MakeActor(boss ? "GoblinKing" : "Goblin-" + type, PrimitiveType.Cube, pos, boss ? new Color(0.8f, 0.1f, 0.2f) : new Color(0.35f, 0.8f, 0.2f));
        go.transform.localScale = boss ? Vector3.one * 2f : Vector3.one * (1f + type * 0.2f);
        var e = go.AddComponent<KelplantisEnemy>(); e.EnemyType = type; e.TargetRole = type == 1 ? CombatRole.Healer : (type == 2 ? CombatRole.Damage : CombatRole.Tank); e.MaxHealth = boss ? 500 : 60;
    }
}
