package com.devn1n.expensetracker;

import android.content.Intent;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Widget")
public class WidgetPlugin extends Plugin {

    // Set when the app is opened from the widget, read once by the web side.
    static String pendingAction = null;

    static void handleIntent(Intent intent) {
        if (intent != null && intent.hasExtra("widget_action")) {
            pendingAction = intent.getStringExtra("widget_action");
            intent.removeExtra("widget_action");
        }
    }

    @PluginMethod
    public void refresh(PluginCall call) {
        ExpenseWidget.updateAll(getContext());
        call.resolve();
    }

    @PluginMethod
    public void consumeAction(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("action", pendingAction == null ? "" : pendingAction);
        pendingAction = null;
        call.resolve(ret);
    }
}
