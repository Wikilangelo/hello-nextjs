type ActionSuccess<T> = [T] extends [undefined] ? { ok: true } : { ok: true; data: T };

type ActionFailure =
	| {
			ok: false;
			errors: Record<string, string[]>;
	  }
	| {
			ok: false;
			message: string;
	  };

export type ActionResult<T = undefined> = ActionSuccess<T> | ActionFailure;
