using System.Collections.Generic;
using UnityEngine;

public class KelplantisGame : MonoBehaviour
{
    public static KelplantisGame I;
    public KelplantisPlayer Player;
    public readonly List<KelplantisEnemy> Enemies = new List<KelplantisEnemy>();
    public int GoblinKills { get; private set; }
    public int Gold { get; private set; }
    public string Area { get; private set; } = "Haven Town";

    void Awake() { I = this; }

    public void RegisterEnemy(KelplantisEnemy e) { if (!Enemies.Contains(e)) Enemies.Add(e); }
    public void UnregisterEnemy(KelplantisEnemy e) { Enemies.Remove(e); }
    public void RegisterKill() { GoblinKills++; Gold += 3; }
    public void AddGold(int n) { Gold += n; }
    public void SetGold(int n) { Gold = Mathf.Max(0, n); }
    public void SetKills(int n) { GoblinKills = Mathf.Max(0, n); }

    void OnGUI()
    {
        GUI.Box(new Rect(12, 12, 390, 118), "KELPLANTIS / GAME-TARGET-001");
        GUI.Label(new Rect(24, 38, 360, 22), "WASD move | Space/LMB attack | F5 save | F9 load");
        if (Player != null) GUI.Label(new Rect(24, 62, 360, 22), $"HP {Player.Health}/{Player.MaxHealth}  LV {Player.Level}  XP {Player.XP}  Gold {Gold}");
        GUI.Label(new Rect(24, 86, 360, 22), $"Area: {Area} | Goblins: {GoblinKills}/{GameConfig.QuestKills}");
        GUI.Label(new Rect(24, 108, 360, 22), GoblinKills >= GameConfig.QuestKills ? "Quest complete: clear the dungeon." : "Quest: defeat five goblins.");
    }

    public void SaveGame()
    {
        if (Player == null) return;
        Player.Save();
        Debug.Log("KELPLANTIS_SAVE PASS");
    }

    public void LoadGame()
    {
        if (Player == null) return;
        Player.Load();
        Debug.Log("KELPLANTIS_LOAD PASS");
    }
}
