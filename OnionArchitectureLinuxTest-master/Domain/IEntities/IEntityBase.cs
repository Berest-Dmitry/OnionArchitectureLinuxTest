namespace Domain.IEntities {
	public interface IEntityBase {
		public interface IEntityBase<TId> {
			TId Id { get; }
		}
	}
}