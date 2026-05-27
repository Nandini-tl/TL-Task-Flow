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
    UNIQUE TIMESTAMP
    FOR SLACK REFRESH
  */

  const refreshId =
    Date.now();

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

      block_id:
        `header_${id}_${refreshId}`,

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

      block_id:
        `context_${id}_${refreshId}`,

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

      block_id:
        `taskname_${id}_${refreshId}`,

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

      block_id:
        `details_${id}_${refreshId}`,

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

            block_id:
              `actions_${id}_${refreshId}`,

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