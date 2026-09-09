class RegistrationsController < Devise::RegistrationsController
  protected

  def sign_up_params
    params.require(:user).permit(
      :email, :password, :password_confirmation,
      :full_name, :username, :college, :role, :github_url, :bio
    )
  end

  def account_update_params
    params.require(:user).permit(
      :email, :password, :password_confirmation, :current_password,
      :full_name, :username, :college, :role, :github_url, :bio
    )
  end
end