using UnityEngine;

public static class KelplantisContent
{
    public static readonly string[] Items = {
        "Rustleaf Blade", "Goblin Fang", "Mossplate", "Haven Ring", "Ember Wand", "Frost Charm", "Iron Buckler", "Thorn Cloak", "Moon Amulet", "Sunsteel Axe",
        "Deepwood Bow", "Marsh Boots", "Kingbreaker", "Cinder Helm", "Riverstone", "Storm Idol", "Ancient Belt", "Warden Mail", "Star Shard", "Eden Relic"
    };
    public static readonly string[] Skills = { "Strike", "Cleave", "Dash", "Whirl", "Guard", "Volley", "Arc", "Stun", "Rend", "Eden Surge" };
    public static int SkillDamage(int index) { return 18 + index * 5; }
    public static string RandomItem() { return Items[Random.Range(0, Items.Length)]; }
}
