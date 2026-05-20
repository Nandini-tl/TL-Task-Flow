export const buildTaskCard = ({
  id,
  taskName,
  assignedBy,
  assignedTo,
  deadline,
  status,
}: any) => {

  const statusConfig: any = {
    pending: "🟡 Pending",
    completed: "🟢 Completed",
    overdue: "🔴 Overdue",
    upcoming: "⏰ Upcoming",
  };

  return [

    // Top Divider
    {
      type: "divider",
    },

    // Header
    {
      type: "header",

      text: {
        type: "plain_text",

        text: "📌 TASK ASSIGNED",
      },
    },

    // Task ID + Status
    {
      type: "context",

      elements: [
        {
          type: "mrkdwn",

          text:
            `*Task ID:* #${id}    •    ` +
            `*Status:* ${statusConfig[status]}`,
        },
      ],
    },

    // Task Name
    {
      type: "section",

      text: {
        type: "mrkdwn",

        text: `* ${taskName}*`,
      },
    },

    // Details
    {
      type: "section",

      fields: [

        {
          type: "mrkdwn",

          text:
            `* Assigned To:* <@${assignedTo}>`,
        },

        {
          type: "mrkdwn",

          text:
            `* Assigned By:* <@${assignedBy}>`,
        },

        {
          type: "mrkdwn",

          text:
            `* Deadline:* ${deadline}`,
        },

        {
          type: "mrkdwn",

          text:
            `* Current Status:* ${statusConfig[status]}`,
        },
      ],
    },

    // Complete Button only for pending
    ...(status === "pending"
      ? [
          {
            type: "actions",

            elements: [
              {
                type: "button",

                text: {
                  type: "plain_text",

                  text: "✅ Mark Complete",
                },

                style: "primary",

                action_id: "complete_task",

                value: String(id),
              },
            ],
          },
        ]
      : []),

    // Bottom Divider
    {
      type: "divider",
    },
  ];
};