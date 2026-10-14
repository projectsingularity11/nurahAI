import { useState } from "react";
import { View } from "react-native";
import { owned, useApp } from "../store/app";
import { dailyStreak, localDate } from "../lib/dates";
import { useLanguage } from "../lib/i18n";
import {
  Button,
  Card,
  EmptyState,
  Label,
  Row,
  SectionHeader,
  TextInput,
} from "./ui";
export function HabitsTasks() {
  const { t } = useLanguage();
  const [kind, setKind] = useState<"habits" | "tasks">("habits");
  const [title, setTitle] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const records = useApp((s) => s.records);
  const put = useApp((s) => s.put);
  const remove = useApp((s) => s.remove);
  const date = localDate();
  return (
    <>
      <SectionHeader
        title={t("Small steps, lasting change", "خطوات صغيرة، تغيير مستمر")}
      />
      <Card>
        <Row>
          <Button
            title={t("Habits", "العادات")}
            variant={kind === "habits" ? "primary" : "secondary"}
            onPress={() => {
              setKind("habits");
              setDeleting(null);
            }}
          />
          <Button
            title={t("Tasks", "المهام")}
            variant={kind === "tasks" ? "primary" : "secondary"}
            onPress={() => {
              setKind("tasks");
              setDeleting(null);
            }}
          />
        </Row>
        <TextInput
          label={
            kind === "habits"
              ? t("A daily habit", "عادة يومية")
              : t("A task for today", "مهمة لليوم")
          }
          placeholder={t("Keep it small and meaningful", "اجعلها صغيرة وهادفة")}
          value={title}
          onChangeText={setTitle}
          maxLength={120}
        />
        <Button
          title={t("Add", "أضف")}
          disabled={!title.trim()}
          onPress={() => {
            if (!title.trim()) return;
            if (kind === "habits")
              put("habits", {
                ...owned(),
                title: title.trim(),
                completed_dates: [],
              });
            else
              put("tasks", {
                ...owned(),
                title: title.trim(),
                completed: false,
                completed_at: null,
              });
            setTitle("");
          }}
        />
      </Card>
      {!records[kind].length && (
        <EmptyState
          title={t("A fresh start", "بداية جديدة")}
          message={t(
            "Add your first small step above.",
            "أضف خطوتك الصغيرة الأولى أعلاه.",
          )}
        />
      )}
      {kind === "habits"
        ? records.habits.map((h) => {
            const completed = h.completed_dates.includes(date);
            return (
              <Card key={h.id}>
                <Row style={{ justifyContent: "space-between" }}>
                  <Label size={18} style={{ flex: 1 }}>
                    {h.title}
                  </Label>
                  <Label gold>
                    {dailyStreak(h.completed_dates)}{" "}
                    {t("day streak", "يوم متتالٍ")}
                  </Label>
                </Row>
                <Row style={{ flexWrap: "wrap" }}>
                  <Button
                    title={
                      completed
                        ? t("Completed today ✓", "اكتملت اليوم ✓")
                        : t("Complete today", "أكمل اليوم")
                    }
                    variant={completed ? "primary" : "secondary"}
                    onPress={() =>
                      put("habits", {
                        ...h,
                        completed_dates: completed
                          ? h.completed_dates.filter((d) => d !== date)
                          : [...h.completed_dates, date],
                      })
                    }
                  />
                  <Button
                    title={
                      deleting === h.id
                        ? t("Confirm delete", "أكّد الحذف")
                        : t("Delete", "حذف")
                    }
                    variant="ghost"
                    onPress={() => {
                      if (deleting === h.id) {
                        remove("habits", h.id);
                        setDeleting(null);
                      } else setDeleting(h.id);
                    }}
                  />
                </Row>
              </Card>
            );
          })
        : records.tasks.map((task) => (
            <Card key={task.id}>
              <Label
                size={18}
                style={
                  task.completed
                    ? { textDecorationLine: "line-through", color: "#A6B8AE" }
                    : undefined
                }
              >
                {task.title}
              </Label>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                <Button
                  title={
                    task.completed
                      ? t("Done ✓ · Undo", "تمت ✓ · تراجع")
                      : t("Complete", "أكمل")
                  }
                  variant={task.completed ? "primary" : "secondary"}
                  onPress={() =>
                    put("tasks", {
                      ...task,
                      completed: !task.completed,
                      completed_at: task.completed
                        ? null
                        : new Date().toISOString(),
                    })
                  }
                />
                <Button
                  title={
                    deleting === task.id
                      ? t("Confirm delete", "أكّد الحذف")
                      : t("Delete", "حذف")
                  }
                  variant="ghost"
                  onPress={() => {
                    if (deleting === task.id) {
                      remove("tasks", task.id);
                      setDeleting(null);
                    } else setDeleting(task.id);
                  }}
                />
              </View>
            </Card>
          ))}
    </>
  );
}
