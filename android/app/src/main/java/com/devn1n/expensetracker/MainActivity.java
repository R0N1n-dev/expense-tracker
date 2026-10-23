package com.devn1n.expensetracker;

import android.content.Intent;
import android.os.Bundle;
import androidx.activity.EdgeToEdge;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(WidgetPlugin.class);
        // Draw behind the system bars on every Android version so the app's own
        // background (and SystemBars icon style) is what the user sees.
        EdgeToEdge.enable(this);
        super.onCreate(savedInstanceState);
        WidgetPlugin.handleIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        WidgetPlugin.handleIntent(intent);
    }
}
