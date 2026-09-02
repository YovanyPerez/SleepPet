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
  "android.permission.ACTIVITY_RECOGNITION",
  "android.permission.QUERY_ALL_PACKAGES",
  "android.permission.SCHEDULE_EXACT_ALARM",
  "android.permission.CAMERA",
  "android.permission.WAKE_LOCK",
];

const PACKAGE_ADDS = [
  "add(AccessibilityPackage())",
  "add(NotificationPackage())",
  "add(ReminderPackage())",
  "add(MovementPackage())",
];

function hasPermission(manifest, name) {
  const list = manifest["uses-permission"] || [];
  return list.some(
    (p) => p.$ && p.$["android:name"] === name
  );
}

function hasElement(list, name) {
  return list.some(
    (item) => item.$ && item.$["android:name"] === name
  );
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  const entries = fs.readdirSync(src, {
    withFileTypes: true,
  });
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of entries) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

module.exports = function withSleepPetNative(config) {
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    manifest["uses-permission"] =
      manifest["uses-permission"] || [];

    for (const permission of PERMISSIONS) {
      if (!hasPermission(manifest, permission)) {
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
          "android:foregroundServiceType": "specialUse",
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

      copyDir(
        path.join(nativeRoot, "java"),
        path.join(
          projectRoot,
          "android",
          "app",
          "src",
          "main",
          "java"
        )
      );

      copyDir(
        path.join(nativeRoot, "res"),
        path.join(
          projectRoot,
          "android",
          "app",
          "src",
          "main",
          "res"
        )
      );

        return config;
      },
    ]
  );

  return config;
};