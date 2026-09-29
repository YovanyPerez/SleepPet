const fs = require("fs");
const path = require("path");
const {
  withAndroidManifest,
  withMainApplication,
  withDangerousMod,
} = require("@expo/config-plugins");

const PERMISSIONS = [
  "android.permission.POST_NOTIFICATIONS",
  "android.permission.FOREGROUND_SERVICE",
  "android.permission.FOREGROUND_SERVICE_SPECIAL_USE",
  "android.permission.FOREGROUND_SERVICE_MICROPHONE",
  "android.permission.ACTIVITY_RECOGNITION",
  "android.permission.QUERY_ALL_PACKAGES",
  "android.permission.SCHEDULE_EXACT_ALARM",
  "android.permission.CAMERA",
  "android.permission.WAKE_LOCK",
  "android.permission.RECORD_AUDIO",
  "android.permission.RECEIVE_BOOT_COMPLETED",
  "android.permission.VIBRATE",
];

const PACKAGE_ADDS = [
  "add(SleepPetPackage())",
];

function hasElement(list, name) {
  return list.some(
    (item) => item.$ && item.$["android:name"] === name
  );
}

module.exports = function withSleepPetNative(config) {
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    manifest["uses-permission"] =
      manifest["uses-permission"] || [];

    for (const permission of PERMISSIONS) {
      if (!hasElement(manifest["uses-permission"], permission)) {
        manifest["uses-permission"].push({
          $: { "android:name": permission },
        });
      }
    }

    const application =
      manifest.application && manifest.application[0];

    if (!application) return config;

    application.service = application.service || [];
    application.receiver = application.receiver || [];
    application.activity = application.activity || [];

    if (
      !hasElement(
        application.service,
        ".SleepForegroundService"
      )
    ) {
      application.service.push({
        $: {
          "android:name": ".SleepForegroundService",
          "android:exported": "false",
          "android:stopWithTask": "false",
          "android:foregroundServiceType": "specialUse|microphone",
        },
        property: [
          {
            $: {
              "android:name":
                "android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE",
              "android:value":
                "Tracks the sleep session while the phone screen is off",
            },
          },
        ],
      });
    }

    if (
      !hasElement(
        application.service,
        ".UnlockAccessibilityService"
      )
    ) {
      application.service.push({
        $: {
          "android:name": ".UnlockAccessibilityService",
          "android:permission":
            "android.permission.BIND_ACCESSIBILITY_SERVICE",
          "android:exported": "true",
        },
        "intent-filter": [
          {
            action: [
              {
                $: {
                  "android:name":
                    "android.accessibilityservice.AccessibilityService",
                },
              },
            ],
          },
        ],
        "meta-data": [
          {
            $: {
              "android:name": "android.accessibilityservice",
              "android:resource": "@xml/accessibility_config",
            },
          },
        ],
      });
    }

    if (
      !hasElement(
        application.receiver,
        ".ReminderReceiver"
      )
    ) {
      application.receiver.push({
        $: {
          "android:name": ".ReminderReceiver",
          "android:exported": "false",
        },
      });
    }

    if (
      !hasElement(
        application.receiver,
        ".SmartAlarmReceiver"
      )
    ) {
      application.receiver.push({
        $: {
          "android:name": ".SmartAlarmReceiver",
          "android:exported": "false",
        },
      });
    }

    if (
      !hasElement(
        application.activity,
        ".SmartAlarmDismissActivity"
      )
    ) {
      application.activity.push({
        $: {
          "android:name": ".SmartAlarmDismissActivity",
          "android:exported": "false",
          "android:screenOrientation": "portrait",
          "android:showOnLockScreen": "true",
          "android:turnScreenOn": "true",
          "android:launchMode": "singleTask",
        },
      });
    }

    if (
      !hasElement(
        application.receiver,
        ".PetCheckReceiver"
      )
    ) {
      application.receiver.push({
        $: {
          "android:name": ".PetCheckReceiver",
          "android:exported": "false",
        },
      });
    }

    if (
      !hasElement(
        application.receiver,
        ".BootReceiver"
      )
    ) {
      application.receiver.push({
        $: {
          "android:name": ".BootReceiver",
          "android:exported": "true",
        },
        "intent-filter": [
          {
            action: [
              { $: { "android:name": "android.intent.action.BOOT_COMPLETED" } },
            ],
          },
        ],
      });
    }

    return config;
  });

  config = withMainApplication(config, (config) => {
    const current = config.modResults;
    let content = current && current.contents;

    if (typeof content === "string") {
      for (const addition of PACKAGE_ADDS) {
        if (!content.includes(addition)) {
          content = content.replace(
            /(PackageList\(this\)\.packages\.apply\s*\{)/,
            `$1\n\n            ${addition}`
          );
        }
      }

      config.modResults = {
        ...current,
        contents: content,
      };
    }

    return config;
  });

  config = withDangerousMod(
    config,
    [
      "android",
      (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const nativeRoot = path.join(
        projectRoot,
        "plugins",
        "native"
      );

      const javaSrc = path.join(nativeRoot, "java");
      if (fs.existsSync(javaSrc)) {
        fs.cpSync(
          javaSrc,
          path.join(
            projectRoot,
            "android",
            "app",
            "src",
            "main",
            "java"
          ),
          { recursive: true }
        );
      }

      const resSrc = path.join(nativeRoot, "res");
      if (fs.existsSync(resSrc)) {
        fs.cpSync(
          resSrc,
          path.join(
            projectRoot,
            "android",
            "app",
            "src",
            "main",
            "res"
          ),
          { recursive: true }
        );
      }

        return config;
      },
    ]
  );

  return config;
};