using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[CreateAssetMenu(fileName = "New Blueprint", menuName = "Blueprint")]
public class Blueprint : ScriptableObject
{
    public List<Vector3> objectPositions;
    public List<Quaternion> objectRotations;

    public int GetObjectCount()
    {
        return objectPositions.Count;
    }
}
