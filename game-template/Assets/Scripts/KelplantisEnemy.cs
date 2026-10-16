using UnityEngine;

public class KelplantisEnemy : MonoBehaviour
{
    public CombatRole TargetRole = CombatRole.Damage;
    public int EnemyType;
    public int MaxHealth = 60;
    int health;
    float nextHit;
    Transform target;

    void Start() { health = MaxHealth + EnemyType * 20; if (KelplantisGame.I != null) KelplantisGame.I.RegisterEnemy(this); }

    void Update()
    {
        if (KelplantisGame.I == null) return;
        target = SelectRoleTarget();
        if (target == null) return;
        Vector3 flat = target.position - transform.position; flat.y = 0;
        float d = flat.magnitude;
        if (d > 1.6f) transform.position += flat.normalized * (2.2f + EnemyType * 0.35f) * Time.deltaTime;
        else if (Time.time >= nextHit)
        {
            nextHit = Time.time + 1.0f;
            var role = target.GetComponent<KelplantisRoleTarget>();
            if (role != null) role.TakeDamage(7 + EnemyType * 3);
            var p = target.GetComponent<KelplantisPlayer>();
            if (p != null) p.TakeDamage(7 + EnemyType * 3);
        }
    }

    Transform SelectRoleTarget()
    {
        KelplantisRoleTarget[] roles = Object.FindObjectsOfType<KelplantisRoleTarget>();
        Transform best = null; float bestDist = float.MaxValue;
        foreach (var r in roles)
        {
            if (r == null || r.Role != TargetRole) continue;
            float d = (r.transform.position - transform.position).sqrMagnitude;
            if (d < bestDist) { bestDist = d; best = r.transform; }
        }
        if (best != null) return best;
        return KelplantisGame.I.Player != null ? KelplantisGame.I.Player.transform : null;
    }

    public void TakeDamage(int amount)
    {
        health -= amount;
        if (health > 0) return;
        if (KelplantisGame.I != null)
        {
            KelplantisGame.I.RegisterKill();
            if (KelplantisGame.I.Player != null) KelplantisGame.I.Player.AddXP(35 + EnemyType * 15);
        }
        DropLoot();
        if (KelplantisGame.I != null) KelplantisGame.I.UnregisterEnemy(this);
        Destroy(gameObject);
    }

    void DropLoot()
    {
        var item = GameObject.CreatePrimitive(PrimitiveType.Cube);
        item.name = "Loot"; item.transform.position = transform.position + Vector3.up * 0.5f; item.transform.localScale = Vector3.one * 0.45f;
        item.GetComponent<Renderer>().material.color = new Color(0.8f, 0.65f, 0.1f);
        var loot = item.AddComponent<KelplantisLoot>(); loot.Gold = 2 + EnemyType * 2; Destroy(item, 20f);
    }
}
