using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class UIManager : MonoBehaviour
{
    public Text messageText;

    public void ShowMessage(string message)
    {
        messageText.text = message;
    }
}
