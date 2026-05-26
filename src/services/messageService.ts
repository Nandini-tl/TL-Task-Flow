export const buildTaskCard = ({
  id,
  taskName,
  assignedBy,
  assignedTo,
  deadline,
  status,
  priority,
}: any) => {

  /*
    STATUS CONFIG
  */

  const statusConfig: any = {

    pending:
      "🟡 Pending",

    completed:
      "🟢 Completed",

    overdue:
      "🔴 Overdue",

    upcoming:
      "⏰ Upcoming",
  };

  /*
    PRIORITY CONFIG
  */

  const priorityConfig: any = {

    high:
      "🔴 High",

    medium:
      "🟡 Medium",

    low:
      "🟢 Low",
  };

  return [

    /*
      TOP DIVIDER
    */

    {
      type:
        "divider",
    },

    /*
      HEADER
    */

    {
      type:
        "header",

      text: {

        type:
          "plain_text",

        text:
          "📌 TASK ASSIGNED",
      },
    },

    /*
      TASK ID + STATUS
    */

    {
      type:
        "context",

      elements: [

        {
          type:
            "mrkdwn",

          text:

            `*Task ID:* #${id}   •   ` +

            `*Status:* ${statusConfig[status]}`,
        },
      ],
    },

    /*
      TASK NAME
    */

    {
      type:
        "section",

      text: {

        type:
          "mrkdwn",

        text:
          `*${taskName}*`,
      },
    },

    /*
      DETAILS SECTION
    */

    {
      type:
        "section",

      fields: [

        /*
          ASSIGNED TO
        */

        {
          type:
            "mrkdwn",

          text:

            `*Assigned To:* <@${assignedTo}>`,
        },

        /*
          ASSIGNED BY
        */

        {
          type:
            "mrkdwn",

          text:

            `*Assigned By:* <@${assignedBy}>`,
        },

        /*
          DEADLINE
        */

        {
          type:
            "mrkdwn",

          text:

            `*Deadline:* ${deadline}`,
        },

        /*
          PRIORITY
        */

        {
          type:
            "mrkdwn",

          text:

            `*Priority:* ${priorityConfig[priority]}`,
        },
      ],
    },

    /*
      COMPLETE BUTTON
    */

    ...(status === "pending"

      ? [

          {
            type:
              "actions",

            elements: [

              {
                type:
                  "button",

                text: {

                  type:
                    "plain_text",

                  text:
                    "✅ Mark Complete",
                },

                style:
                  "primary",

                action_id:
                  "complete_task",

                value:
                  String(id),
              },
            ],
          },
        ]

      : []),

    /*
      BOTTOM DIVIDER
    */

    {
      type:
        "divider",
    },
  ];
};