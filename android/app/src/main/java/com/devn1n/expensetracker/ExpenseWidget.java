package com.devn1n.expensetracker;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;
import org.json.JSONArray;
import org.json.JSONObject;

public class ExpenseWidget extends AppWidgetProvider {

    private static final double DEFAULT_BUDGET = 900000;

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        for (int id : ids) {
            manager.updateAppWidget(id, build(context));
        }
    }

    static void updateAll(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        int[] ids = manager.getAppWidgetIds(new ComponentName(context, ExpenseWidget.class));
        for (int id : ids) {
            manager.updateAppWidget(id, build(context));
        }
    }

    private static String money(double n) {
        return "UGX " + NumberFormat.getIntegerInstance(Locale.US).format(Math.round(n));
    }

    private static PendingIntent launch(Context context, int requestCode, String action) {
        Intent intent = new Intent(context, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        if (action != null) intent.putExtra("widget_action", action);
        return PendingIntent.getActivity(
            context, requestCode, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    static RemoteViews build(Context context) {
        // Capacitor Preferences stores everything in this SharedPreferences file.
        SharedPreferences sp = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);

        double budget = DEFAULT_BUDGET;
        try {
            budget = Double.parseDouble(sp.getString("budget", String.valueOf((long) DEFAULT_BUDGET)));
        } catch (Exception ignored) {}
        if (budget <= 0) budget = DEFAULT_BUDGET;

        double spent = 0;
        try {
            JSONArray list = new JSONArray(sp.getString("expenses", "[]"));
            Calendar now = Calendar.getInstance();
            Calendar when = Calendar.getInstance();
            for (int i = 0; i < list.length(); i++) {
                JSONObject e = list.getJSONObject(i);
                when.setTimeInMillis(e.getLong("t"));
                if (when.get(Calendar.YEAR) == now.get(Calendar.YEAR)
                        && when.get(Calendar.MONTH) == now.get(Calendar.MONTH)) {
                    spent += e.getDouble("amt");
                }
            }
        } catch (Exception ignored) {}

        double left = budget - spent;
        boolean over = left < 0;

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_expense);
        views.setTextViewText(R.id.w_month, new SimpleDateFormat("MMMM", Locale.getDefault()).format(new Date()));
        views.setTextViewText(R.id.w_spent, money(spent));
        views.setTextViewText(R.id.w_left, over ? money(-left) + " over budget" : money(left) + " left");
        views.setTextColor(R.id.w_left, context.getColor(over ? R.color.widget_over : R.color.widget_mute));
        views.setProgressBar(R.id.w_bar, 1000, (int) Math.min(1000, Math.round(spent / budget * 1000)), false);

        views.setOnClickPendingIntent(R.id.w_root, launch(context, 0, null));
        views.setOnClickPendingIntent(R.id.w_add, launch(context, 1, "add"));
        return views;
    }
}
