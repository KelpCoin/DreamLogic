using UnityEngine;

public class KelplantisLoot : MonoBehaviour
{
    public int Gold = 3;
    void Update()
    {
        var p = KelplantisGame.I != null ? KelplantisGame.I.Player : null;
        if (p != null && Vector3.Distance(transform.position, p.transform.position) < 1.4f)
        {
            KelplantisGame.I.AddGold(Gold);
            Destroy(gameObject);
        }
        transform.Rotate(0, 80f * Time.deltaTime, 0);
    }
}
