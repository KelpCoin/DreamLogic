using UnityEngine;

public class KelplantisRoleTarget : MonoBehaviour
{
    public CombatRole Role;
    public int Priority;
    public int Health = 80;
    public void TakeDamage(int amount)
    {
        Health -= amount;
        if (Health <= 0) { Health = 80; transform.position = new Vector3(Random.Range(-6, 7), 0.8f, Random.Range(-6, 7)); }
    }
}
