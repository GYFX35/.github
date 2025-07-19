using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PuzzleManager : MonoBehaviour
{
    public Blueprint blueprint;
    public AIEnvironmentController aiEnvironmentController;
    private List<GameObject> placedObjects = new List<GameObject>();

    public void AddPlacedObject(GameObject obj)
    {
        placedObjects.Add(obj);
        CheckPuzzleCompletion();
    }

    private void CheckPuzzleCompletion()
    {
        if (placedObjects.Count == blueprint.GetObjectCount())
        {
            // In a real game, we'd do a more thorough check to see if the placed objects match the blueprint.
            Debug.Log("Puzzle Complete!");
            aiEnvironmentController.UpdateEnvironment();
        }
    }
}
