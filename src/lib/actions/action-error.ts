import type { ActionResult } from "@/lib/actions/action-result";

export function actionError<T = undefined>(
	message = "Something went wrong. Please try again.",
): ActionResult<T> {
	return {
		ok: false,
		message,
	};
}
