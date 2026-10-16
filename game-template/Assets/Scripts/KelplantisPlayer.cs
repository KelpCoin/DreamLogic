using UnityEngine;

public enum CombatRole { Tank, Healer, Damage }

public class KelplantisPlayer : MonoBehaviour
{
    public CombatRole Role = CombatRole.Damage;
    public int MaxHealth = 100;
    public int Health = 100;
    public int Level = 1;
    public int XP = 0;
    public float Speed = 7f;
    public float AttackRange = 8f;
    public float AttackCooldown = 0.35f;
    public int ActiveSkill { get; private set; }
    float nextAttack;
    Camera cam;

    void Start() { cam = Camera.main; if (KelplantisGame.I != null) KelplantisGame.I.Player = this; }

    void Update()
    {
        Vector3 input = new Vector3(Input.GetAxisRaw("Horizontal"), 0, Input.GetAxisRaw("Vertical"));
        if (input.sqrMagnitude > 1) input.Normalize();
        transform.position += input * Speed * Time.deltaTime;
        transform.position = new Vector3(Mathf.Clamp(transform.position.x, -42, 42), 0.8f, Mathf.Clamp(transform.position.z, -42, 58));
        if (cam != null) { cam.transform.position = new Vector3(transform.position.x, 16, transform.position.z - 11); cam.transform.LookAt(transform.position); }
        for (int i = 0; i < 10; i++) if (Input.GetKeyDown(KeyCode.Alpha1 + i)) ActiveSkill = i;
        if ((Input.GetKey(KeyCode.Space) || Input.GetMouseButton(0)) && Time.time >= nextAttack) Attack();
        if (Input.GetKeyDown(KeyCode.F5)) KelplantisGame.I.SaveGame();
        if (Input.GetKeyDown(KeyCode.F9)) KelplantisGame.I.LoadGame();
    }

    void Attack()
    {
        nextAttack = Time.time + AttackCooldown;
        KelplantisEnemy best = null; float bestDist = AttackRange * AttackRange;
        foreach (var e in KelplantisGame.I.Enemies) { if (e == null) continue; float d = (e.transform.position - transform.position).sqrMagnitude; if (d < bestDist) { bestDist = d; best = e; } }
        if (best != null) best.TakeDamage(KelplantisContent.SkillDamage(ActiveSkill) + Level * 4);
    }

    public void AddXP(int amount)
    {
        XP += amount; int need = Level * 100;
        while (XP >= need) { XP -= need; Level++; MaxHealth += 15; Health = MaxHealth; need = Level * 100; }
    }
    public void TakeDamage(int amount) { Health -= amount; if (Health <= 0) { Health = MaxHealth; transform.position = new Vector3(0, 0.8f, 0); } }
    public void Save()
    {
        PlayerPrefs.SetFloat("kelp_x", transform.position.x); PlayerPrefs.SetFloat("kelp_z", transform.position.z); PlayerPrefs.SetInt("kelp_hp", Health);
        PlayerPrefs.SetInt("kelp_level", Level); PlayerPrefs.SetInt("kelp_xp", XP); PlayerPrefs.SetInt("kelp_gold", KelplantisGame.I.Gold); PlayerPrefs.SetInt("kelp_kills", KelplantisGame.I.GoblinKills); PlayerPrefs.SetInt("kelp_skill", ActiveSkill); PlayerPrefs.Save();
    }
    public void Load()
    {
        if (!PlayerPrefs.HasKey("kelp_level")) return;
        transform.position = new Vector3(PlayerPrefs.GetFloat("kelp_x"), 0.8f, PlayerPrefs.GetFloat("kelp_z")); Health = PlayerPrefs.GetInt("kelp_hp", MaxHealth);
        Level = PlayerPrefs.GetInt("kelp_level", 1); XP = PlayerPrefs.GetInt("kelp_xp", 0); ActiveSkill = PlayerPrefs.GetInt("kelp_skill", 0);
        KelplantisGame.I.SetGold(PlayerPrefs.GetInt("kelp_gold", 0)); KelplantisGame.I.SetKills(PlayerPrefs.GetInt("kelp_kills", 0));
    }
}
