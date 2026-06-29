import type { ActionResult } from "@/lib/actions/action-result";

export function actionError<T = undefined>(message: string): ActionResult<T> {
	return {
		ok: false,
		message,
	};
}
